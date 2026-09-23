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
    console.log('📍 Diretório atual (PWD):', currentPwd);

    const list = await client.list();
    console.log('📁 Itens no diretório atual:');
    list.forEach(item => console.log(`  - ${item.name} (${item.isDirectory ? 'dir' : 'file'})`));

    // Se estiver na raiz e tiver public_html
    if (list.some(i => i.name === 'public_html')) {
      console.log('🚀 Enviando para public_html...');
      await client.cd('public_html');
      await client.uploadFromDir(distDir);
      console.log('✅ Upload concluído em public_html');
      await client.cd(currentPwd);
    }

    // Se tiver a pasta domains
    if (list.some(i => i.name === 'domains')) {
      console.log('🚀 Verificando pasta domains...');
      await client.cd('domains');
      const domainsList = await client.list();
      for (const d of domainsList) {
        if (d.isDirectory) {
          console.log(`🚀 Enviando para domains/${d.name}/public_html...`);
          await client.cd(d.name);
          const domainSub = await client.list();
          if (domainSub.some(i => i.name === 'public_html')) {
            await client.cd('public_html');
            await client.uploadFromDir(distDir);
            await client.cd('..');
          } else {
            await client.uploadFromDir(distDir);
          }
          console.log(`✅ Upload concluído em domains/${d.name}`);
          await client.cd('..');
        }
      }
      await client.cd(currentPwd);
    }

    console.log('🎉 Deploy concluído com 100% de sucesso!');
  } catch (err) {
    console.error('❌ Erro durante o deploy FTP:', err);
    process.exit(1);
  } finally {
    client.close();
  }
}

deploy();
