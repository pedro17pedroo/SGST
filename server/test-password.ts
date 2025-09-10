import bcrypt from 'bcryptjs';

async function testPassword() {
  const storedHash = '$2a$10$atwOfmuN4T0XF4jE0Vk/r.t2QC/8kFShTgg9nb.MgytKSvG6RQrhy';
  const password = 'admin123';
  
  try {
    const isValid = await bcrypt.compare(password, storedHash);
    console.log('Senha "admin123" é válida:', isValid);
    
    // Testar outras senhas possíveis
    const otherPasswords = ['admin', 'password', '123456', 'admin@123'];
    for (const pwd of otherPasswords) {
      const valid = await bcrypt.compare(pwd, storedHash);
      console.log(`Senha "${pwd}" é válida:`, valid);
    }
  } catch (error) {
    console.error('Erro ao testar senha:', error);
  }
}

testPassword();