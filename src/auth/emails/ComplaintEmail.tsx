import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components';
import * as React from 'react';

interface ComplaintEmailProps {
    idReclamo: string;
    consumerName: string;
    consumerEmail: string;
    consumerPhone: string;
    consumerDocNumber: string;
    consumerAddress: string;
    goodType: string;
    claimType: string;
    claimAmount: string;
    goodDescription: string;
    claimDetail: string;
    orderRequest: string;
    createdAt: string;
}

export const ComplaintEmail = ({
    idReclamo,
    consumerName,
    consumerEmail,
    consumerPhone,
    consumerDocNumber,
    consumerAddress,
    goodType,
    claimType,
    claimAmount,
    goodDescription,
    claimDetail,
    orderRequest,
    createdAt
}: ComplaintEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Nuevo Reclamo registrado - {idReclamo}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={logoContainer}>
                        <Img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2VvetN6v-8ZlB3RT4zSBjBnTbOVleM7XRAA&s"
                            alt="Injoyplan"
                            width="120"
                            height="auto"
                            style={logo}
                        />
                    </Section>
                    <Heading style={h1}>Nuevo Reclamo Registrado</Heading>
                    <Text style={text}>
                        Se ha registrado un nuevo reclamo/queja en el Libro de Reclamaciones.
                    </Text>

                    <Section style={box}>
                        <Text style={paragraph}>
                            <strong style={label}>ID Reclamo:</strong> {idReclamo}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Fecha:</strong> {createdAt}
                        </Text>
                        <Hr style={hr} />

                        <Heading as="h3" style={{ ...h2, marginTop: 0 }}>Datos del Consumidor</Heading>
                        <Text style={paragraph}>
                            <strong style={label}>Nombre:</strong> {consumerName}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Documento:</strong> {consumerDocNumber}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Email:</strong> <a href={`mailto:${consumerEmail}`} style={link}>{consumerEmail}</a>
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Teléfono:</strong> {consumerPhone}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Dirección:</strong> {consumerAddress}
                        </Text>

                        <Hr style={hr} />

                        <Heading as="h3" style={h2}>Detalle del Reclamo</Heading>
                        <Text style={paragraph}>
                            <strong style={label}>Tipo de Bien:</strong> {goodType}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Monto Reclamado:</strong> {claimAmount}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Descripción del Bien:</strong> {goodDescription}
                        </Text>
                        <Text style={paragraph}>
                            <strong style={label}>Tipo:</strong> {claimType}
                        </Text>

                        <Text style={paragraph}>
                            <strong style={label}>Detalle:</strong>
                        </Text>
                        <Text style={messageContent}>
                            {claimDetail}
                        </Text>

                        <Container className="bg-white border border-gray-200 rounded my-10 px-10 py-5 mx-auto max-w-[600px]">
                            <Section className="mt-8 mb-6 text-center">
                                <Img
                                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2VvetN6v-8ZlB3RT4zSBjBnTbOVleM7XRAA&s"
                                    alt="Injoyplan Logo"
                                    width="120"
                                    className="mx-auto"
                                />
                            </Section>
                            <Heading className="text-[#202020] text-2xl font-bold text-center p-0 my-8 mx-0">
                                Constancia de Reclamo
                            </Heading>
                            <Text className="text-[#404040] text-base leading-6 text-center">
                                Hola <strong>{consumerName}</strong>,
                            </Text>
                        </Container>

                        <Text style={paragraph}>
                            <strong style={label}>Pedido del Consumidor:</strong>
                        </Text>
                        <Text style={messageContent}>
                            {orderRequest}
                        </Text>
                    </Section>

                    <Text style={footer}>
                        Injoyplan - Libro de Reclamaciones Virtual
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default ComplaintEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
    padding: '20px 0',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px',
    marginBottom: '64px',
    borderRadius: '12px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
    maxWidth: '600px',
};

const logoContainer = {
    textAlign: 'center' as const,
    marginBottom: '32px',
};

const logo = {
    margin: '0 auto',
};

const h1 = {
    color: '#212121',
    fontSize: '24px',
    fontWeight: '700',
    textAlign: 'center' as const,
    margin: '0 0 24px',
};

const h2 = {
    color: '#212121',
    fontSize: '18px',
    fontWeight: '600',
    margin: '16px 0 12px',
};

const text = {
    color: '#525f7f',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
    marginBottom: '24px',
};

const box = {
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
};

const paragraph = {
    fontSize: '15px',
    lineHeight: '24px',
    margin: '0 0 8px',
    color: '#333',
};

const label = {
    color: '#277FA4',
    fontWeight: '600',
};

const link = {
    color: '#277FA4',
    textDecoration: 'none',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const messageContent = {
    fontSize: '15px',
    lineHeight: '26px',
    color: '#555',
    backgroundColor: '#fff',
    padding: '16px',
    borderRadius: '6px',
    border: '1px solid #e6ebf1',
    marginTop: '8px',
    marginBottom: '16px'
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '32px',
};
