import * as ftp from 'basic-ftp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

async function deploy() {
  const client = new ftp.Client();
  client.ftp.verbose = true;

  const host = process.env.FTP_SERVER;
  const user = process.env.FTP_USERNAME;
  const password = process.env.FTP_PASSWORD;

  if (!host || !user || !password) {
    console.error('❌ Credenciais de FTP não encontradas nas variáveis de ambiente.');
    process.exit(1);
  }

  try {
    console.log(`🔌 Conectando ao servidor FTP ${host}...`);
    await client.access({
      host,
      user,
      password,
      secure: false,
    });
    console.log('✅ Conexão FTP estabelecida com sucesso!');

    console.log(`🚀 Fazendo upload direto dos arquivos de ${distDir} para public_html...`);
    await client.ensureDir('public_html');
    await client.uploadFromDir(distDir);

    const uploadedList = await client.list();
    let summaryMd = `### 📊 Diagnóstico do Deploy FTP na Hostinger\n\n`;
    summaryMd += `- **Servidor:** \`${host}\`\n`;
    summaryMd += `- **Usuário:** \`${user}\`\n`;
    summaryMd += `- **Diretório FTP atual:** \`${await client.pwd()}\`\n\n`;
    summaryMd += `#### 📁 Arquivos encontrados em public_html:\n`;
    uploadedList.forEach(item => {
      summaryMd += `- \`${item.name}\` (${item.isDirectory ? 'pasta' : item.size + ' bytes'})\n`;
    });

    if (process.env.GITHUB_STEP_SUMMARY) {
      import('fs').then(fs => fs.writeFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd));
    }

    console.log('🎉 Deploy concluído!');
  } catch (err) {
    console.error('❌ Erro durante o deploy FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
