import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { EmailService } from '../auth/email.service';

@Injectable()
export class ComplaintsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) { }

  async create(createComplaintDto: CreateComplaintDto) {
    const {
      consumerName, consumerDocType, consumerDocNumber, consumerAddress, consumerDepartment, consumerProvince, consumerDistrict, consumerPhone, consumerEmail,
      isMinor, repName, repDocType, repDocNumber, repAddress, repDepartment, repProvince, repDistrict, repPhone, repEmail,
      goodType, claimAmount, goodDescription,
      claimType, claimDetail, orderRequest
    } = createComplaintDto;

    const complaint = await this.prisma.complaint.create({
      data: {
        consumerName, consumerDocType, consumerDocNumber, consumerAddress, consumerDepartment, consumerProvince, consumerDistrict, consumerPhone, consumerEmail,
        isMinor: isMinor ?? false,
        repName, repDocType, repDocNumber, repAddress, repDepartment, repProvince, repDistrict, repPhone, repEmail,
        goodType, claimAmount, goodDescription,
        claimType, claimDetail, orderRequest
      },
    });

    // Send email notification
    try {
      await this.emailService.sendComplaintEmail({
        idReclamo: complaint.id,
        consumerName,
        consumerEmail,
        consumerPhone,
        consumerDocNumber,
        consumerAddress,
        goodType,
        claimType,
        claimAmount: claimAmount?.toString() || '0',
        goodDescription,
        claimDetail,
        orderRequest,
        createdAt: complaint.createdAt.toLocaleString('es-PE', { timeZone: 'America/Lima' })
      });
    } catch (error) {
      console.error("Failed to send complaint email", error);
    }

    return { message: 'Reclamación registrada y correo enviado', id: complaint.id };
  }
}
