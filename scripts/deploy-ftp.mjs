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

    const currentPwd = await client.pwd();
    console.log('📍 Diretório FTP atual (PWD):', currentPwd);

    const list = await client.list();
    console.log('📁 Itens no diretório:', list.map(i => `${i.name} (${i.isDirectory ? 'dir' : 'file'})`).join(', '));

    const hasPublicHtml = list.some(item => item.name === 'public_html' && item.isDirectory);

    if (hasPublicHtml) {
      console.log('🚀 Entrando em public_html...');
      await client.cd('public_html');
    } else {
      console.log('🚀 Já no diretório raiz de publicação!');
    }

    console.log(`🚀 Fazendo upload dos arquivos compilados de ${distDir}...`);
    await client.uploadFromDir(distDir);

    const finalFiles = await client.list();
    console.log('🎉 Arquivos publicados:', finalFiles.map(f => f.name).join(', '));
  } catch (err) {
    console.error('❌ Erro durante o deploy FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
