import * as React from 'react';
import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Hr,
} from '@react-email/components';

interface VerificationEmailProps {
    code: string;
}

export const VerificationEmail = ({ code }: VerificationEmailProps) => {
    return (
        <Html>
            <Head />
            <Preview>Verifica tu cuenta en Injoyplan</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={box}>
                        <Section style={logoContainer}>
                            <Img
                                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2VvetN6v-8ZlB3RT4zSBjBnTbOVleM7XRAA&s"
                                width="120"
                                height="auto"
                                alt="Injoyplan"
                                style={logo}
                            />
                        </Section>

                        <Heading style={heading}>Verifica tu correo electrónico</Heading>
                        <Text style={paragraph}>
                            Gracias por registrarte en Injoyplan. Para completar tu registro y asegurar tu cuenta, por favor ingresa el siguiente código de verificación:
                        </Text>

                        <Section style={codeContainer}>
                            <Text style={codeText}>{code}</Text>
                        </Section>

                        <Text style={paragraph}>
                            Este código expirará en 10 minutos. Si no solicitaste este código, puedes ignorar este mensaje de forma segura.
                        </Text>

                        <Hr style={hr} />

                        <Text style={footer}>
                            &copy; {new Date().getFullYear()} Injoyplan. Todos los derechos reservados.
                            <br />
                            <Link href="https://injoyplan.com" style={anchor}>www.injoyplan.com</Link>
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default VerificationEmail;

const main = {
    backgroundColor: '#f6f9fc',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
    backgroundColor: '#ffffff',
    margin: '0 auto',
    padding: '40px 0',
    marginBottom: '64px',
};

const box = {
    padding: '0 48px',
};

const logoContainer = {
    marginBottom: '32px',
    textAlign: 'center' as const,
};

const logo = {
    margin: '0 auto',
};

const heading = {
    fontSize: '24px',
    letterSpacing: '-0.5px',
    lineHeight: '1.3',
    fontWeight: '700',
    color: '#212121',
    marginTop: '0',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const paragraph = {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#666666',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const codeContainer = {
    backgroundColor: '#F0F8FA', // Light blue tint based on #007FA4
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    textAlign: 'center' as const,
    border: '1px solid #E1E8ED',
};

const codeText = {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: '36px',
    letterSpacing: '8px',
    color: '#007FA4', // Brand color
    margin: '0',
    lineHeight: '1',
};

const hr = {
    borderColor: '#e6ebf1',
    margin: '32px 0',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
};

const anchor = {
    color: '#007FA4',
    textDecoration: 'none',
};
