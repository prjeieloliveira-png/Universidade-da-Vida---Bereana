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
    await client.clearWorkingDir();
    await client.uploadFromDir(distDir);

    console.log('📁 Listagem de arquivos em public_html após upload:');
    const uploadedList = await client.list();
    uploadedList.forEach(item => console.log(`  - ${item.name} (${item.isDirectory ? 'dir' : 'file'})`));

    console.log('🎉 Deploy concluído com 100% de sucesso!');
  } catch (err) {
    console.error('❌ Erro durante o deploy FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
