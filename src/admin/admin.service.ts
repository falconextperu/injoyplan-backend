import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../users/upload.service';
// @ts-ignore
import * as XLSX from 'xlsx';

@Injectable()
export class AdminService {
    constructor(
        private prisma: PrismaService,
        private uploadService: UploadService
    ) { }

    // Dashboard Stats
    async getStats() {
        const [totalUsers, totalEvents, activeBanners, verifiedUsers] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.event.count(),
            this.prisma.banner.count({ where: { isActive: true } }),
            this.prisma.user.count({ where: { isVerified: true } }),
        ]);

        return {
            totalUsers,
            totalEvents,
            activeBanners,
            verifiedUsers,
        };
    }

    // Users Management
    async getUsers(page = 1, limit = 20, search?: string) {
        const skip = (page - 1) * limit;

        const where = search
            ? {
                OR: [
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { profile: { firstName: { contains: search, mode: 'insensitive' as const } } },
                    { profile: { lastName: { contains: search, mode: 'insensitive' as const } } },
                ],
            }
            : {};

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    userType: true,
                    isVerified: true,
                    createdAt: true,
                    profile: {
                        select: {
                            firstName: true,
                            lastName: true,
                            avatar: true,
                        },
                    },
                },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            users,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }

    async updateUserRole(userId: string, role: 'USER' | 'ADMIN') {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                email: true,
                role: true,
            },
        });
    }

    // Banners Management
    async getBanners() {
        return this.prisma.banner.findMany({
            orderBy: { order: 'asc' },
        });
    }

    async createBanner(data: any, file?: Express.Multer.File) {
        let imageUrl = data.imageUrl || '';

        if (file) {
            imageUrl = await this.uploadService.uploadImage(file);
        }

        return this.prisma.banner.create({
            data: {
                title: data.title,
                imageUrl: imageUrl, // Use uploaded or provided URL
                link: data.link,
                isActive: data.isActive === 'true' || data.isActive === true ? true : false, // Handle string/bool from multipart
                order: data.order ? parseInt(data.order.toString()) : 0,
                urlFuente: data.urlFuente,
                horaInicio: data.horaInicio,
                horaFin: data.horaFin,
                fecha: data.fecha ? new Date(data.fecha) : null,
                direccion: data.direccion,
                idRow: data.idRow,
                categoria: data.categoria
            },
        });
    }

    async updateBanner(id: string, data: any, file?: Express.Multer.File) {
        const updateData: any = { ...data };

        if (file) {
            updateData.imageUrl = await this.uploadService.uploadImage(file);
        }

        if (data.fecha) updateData.fecha = new Date(data.fecha);
        if (data.isActive !== undefined) updateData.isActive = data.isActive === 'true' || data.isActive === true;
        if (data.order !== undefined) updateData.order = parseInt(data.order.toString());

        return this.prisma.banner.update({
            where: { id },
            data: updateData,
        });
    }

    async deleteBanner(id: string) {
        return this.prisma.banner.delete({
            where: { id },
        });
    }

    async reorderBanners(bannerIds: string[]) {
        const updates = bannerIds.map((id, index) =>
            this.prisma.banner.update({
                where: { id },
                data: { order: index },
            })
        );
        await Promise.all(updates);
        return { success: true };
    }

    // Events Import from CSV/Excel
    async importEventsFromFile(file: Express.Multer.File) {
        if (!file) throw new Error('No file provided');

        const wb = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetNames = wb.SheetNames;

        // Multi-Sheet Mode (User Specific) (Flexible check)
        if (sheetNames.some(n => n.toLowerCase().includes('eventos'))) {
            return this.importMultiSheet(wb);
        }

        // Single Sheet Mode (Smart Fallback)
        const sheet = wb.Sheets[sheetNames[0]];
        const rows: any[] = XLSX.utils.sheet_to_json(sheet);
        if (rows.length === 0) throw new Error('Archivo vacío');

        // Smart Map (Simpler single sheet logic)
        const firstRow = rows[0];
        if (!firstRow) throw new Error('No hay datos en la hoja');

        const findKey = (candidates: string[]) => Object.keys(firstRow).find(k => candidates.some(c => k.toLowerCase().includes(c)));

        const kTitle = findKey(['titulo', 'title', 'nombre', 'evento']);
        const kDate = findKey(['fecha', 'date', 'dia']);

        if (!kTitle) throw new Error('No se encontró columna de Título en modo simple.');

        const adminUser = await this.getAdminUser();
        let count = 0;
        const errors: string[] = [];

        // Helper to safe get value
        const getVal = (row: any, candidates: string[]) => {
            const key = findKey(candidates);
            return key ? row[key] : undefined;
        };

        for (const row of rows) {
            try {
                const title = row[kTitle];
                if (!title) continue;

                const existing = await this.prisma.event.findFirst({ where: { title: { equals: String(title).trim(), mode: 'insensitive' } } });
                if (existing) {
                    errors.push(`Evento "${title}" duplicado.`);
                    continue;
                }

                await this.prisma.event.create({
                    data: {
                        title: String(title).trim(),
                        description: getVal(row, ['desc', 'descripcion']) || '',
                        category: getVal(row, ['cat', 'categoria']) || 'General',
                        isActive: true,
                        isFeatured: false,
                        user: { connect: { id: adminUser.id } },
                        location: { create: { name: 'Local Importado', department: 'Lima', province: 'Lima', district: '' } },
                        dates: kDate && row[kDate] ? { create: [{ date: new Date(row[kDate]), price: 0 }] } : undefined
                    }
                });
                count++;
            } catch (e: any) { errors.push(e.message); }
        }
        return { count, errors: errors.slice(0, 10), message: `Importados ${count} (Simple Mode)` };
    }

    private async importMultiSheet(wb: XLSX.WorkBook) {
        const getSheet = (name: string) => {
            const n = wb.SheetNames.find(s => s.toLowerCase().includes(name.toLowerCase()));
            return n ? XLSX.utils.sheet_to_json<any>(n ? wb.Sheets[n] : {}) : [];
        };

        const eventos = getSheet('Eventos');
        console.log('Sheet Names:', wb.SheetNames);
        console.log('Eventos count:', eventos.length);
        if (eventos.length > 0) {
            console.log('First event keys:', Object.keys(eventos[0]));
            console.log('First event sample:', JSON.stringify(eventos[0]));
        }

        const imagenes = getSheet('Imagen');
        const entradas = getSheet('Entradas');
        const fechas = getSheet('FechaHorario');
        const plataformas = getSheet('PlataformaVenta');

        // Maps
        const imgMap = new Map();
        imagenes.forEach(r => imgMap.set(r.idRow, r.url));

        const priceMap = new Map();
        entradas.forEach(r => priceMap.set(r.idRow, r.Precio));

        // Ticket URLs Map (Multiple entries per event)
        const ticketMap = new Map<any, { name: string, url: string }[]>();
        plataformas.forEach(r => {
            if (!r.URVenta) return;
            if (!ticketMap.has(r.idRow)) ticketMap.set(r.idRow, []);

            let name = r.Nombre || 'Entrada';
            // Clean up name if needed, or keep as is from Excel
            // User requested "joinnus", "whatsapp 1", etc. so we trust the Excel "Nombre" column usually
            // Just basic fallback if empty.

            ticketMap.get(r.idRow)?.push({ name, url: r.URVenta });
        });

        const dateMap = new Map<any, any[]>();
        fechas.forEach(r => {
            if (!dateMap.has(r.idRow)) dateMap.set(r.idRow, []);
            dateMap.get(r.idRow)?.push(r);
        });

        // Legacy urlMap for single websiteUrl fallback (take the first one if exists)
        // But user wants PlataformaURLnbbb as main.

        const adminUser = await this.getAdminUser();
        let count = 0;
        const errors: string[] = [];

        for (const evt of eventos) {
            try {
                const idRow = evt.idRow;
                const title = evt.nombreevento || evt.NombreEvento || evt.Titulo || evt.Title; // Fallback attempts

                if (!title) {
                    console.log('Skipping row due to missing title. Keys:', Object.keys(evt));
                    continue;
                }

                // Check duplicate
                const existing = await this.prisma.event.findFirst({ where: { title: { equals: String(title).trim(), mode: 'insensitive' } } });
                if (existing) {
                    errors.push(`ID ${idRow}: Evento "${title}" ya exists.`);
                    continue;
                }

                const datesList = dateMap.get(idRow) || [];
                const price = priceMap.get(idRow);
                const datesFormatted = datesList.flatMap(d => {
                    let dateObj = new Date();
                    // Handle Excel serial date
                    if (typeof d.Fecha === 'number') {
                        dateObj = new Date(Math.round((d.Fecha - 25569) * 86400 * 1000));
                    } else if (d.Fecha) {
                        dateObj = new Date(d.Fecha);
                    }

                    // Fix Timezone: Set to Noon UTC to avoid shifting to previous day
                    dateObj.setUTCHours(12, 0, 0, 0);

                    if (isNaN(dateObj.getTime())) return [];

                    const timeString = d.HoraInicio ? String(d.HoraInicio) : '';
                    // Split multiple ranges "17:00-18:30;20:30-22:00"
                    const ranges = timeString.split(';').map(t => t.trim()).filter(Boolean);

                    if (ranges.length === 0) {
                        return [{
                            date: dateObj,
                            startTime: null,
                            endTime: null,
                            price: price ? Number(price) : 0
                        }];
                    }

                    return ranges.map(range => {
                        const [start, end] = range.split('-').map(t => t.trim());
                        return {
                            date: dateObj,
                            startTime: start || null,
                            endTime: end || null,
                            price: price ? Number(price) : 0
                        };
                    });
                });

                // Prioritize PlataformaURLnbbb from Event sheet, fallback to first entry in Platform sheet
                const mainWebsiteUrl = evt.PlataformaURLnbbb || evt.URLWeb || (ticketMap.get(idRow)?.[0]?.url) || null;

                await this.prisma.event.create({
                    data: {
                        title: String(title).trim(),
                        description: evt.DescripcionEvento || evt['DescripciónEvento'] || evt.Description || evt.Descripcion || '',
                        category: evt.Categoria || 'General',
                        isFeatured: Number(evt.Destacado) === 1 || String(evt.Destacado).toLowerCase() === 'si' || evt.Destacado === true,
                        isBanner: Number(evt.esBaner) === 1 || String(evt.esBaner).toLowerCase() === 'si' || evt.esBaner === true,
                        isActive: true,
                        imageUrl: imgMap.get(idRow) || null,
                        websiteUrl: mainWebsiteUrl,
                        ticketUrls: ticketMap.get(idRow) || [], // Save all ticket links
                        user: { connect: { id: adminUser.id } },
                        location: {
                            create: {
                                name: evt.NombreLocal || 'Por definir',
                                address: evt['Dirección'] || evt.Direccion || null,
                                department: evt.Departamento ? String(evt.Departamento).trim() : 'Lima',
                                province: evt.Provincia ? String(evt.Provincia).trim() : 'Lima',
                                district: evt.Distrito ? String(evt.Distrito).trim() : '',
                                latitude: evt.latitud_longitud ? parseFloat(String(evt.latitud_longitud).split(',')[0]) : null,
                                longitude: evt.latitud_longitud ? parseFloat(String(evt.latitud_longitud).split(',')[1]) : null
                            }
                        },
                        dates: datesFormatted.length > 0 ? { create: datesFormatted } : undefined
                    }
                });
                count++;
            } catch (e: any) {
                errors.push(`ID ${evt.idRow}: ${e.message}`);
                console.error(e);
            }
        }

        return {
            count,
            errors: errors.slice(0, 10),
            message: `Importados ${count} eventos (Multi-Sheet).` + (errors.length ? ` ${errors.length} errores.` : '')
        };
    }

    private async getAdminUser() {
        let u = await this.prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true } });
        if (!u) u = await this.prisma.user.findFirst({ select: { id: true } });
        if (!u) throw new Error('No admin user found');
        return u;
    }

    private parseCSVLine(line: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
}
