import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { usersTable } from "../shared/schema";
import { eq } from "drizzle-orm";

// Verificar status de admin de um usuário
async function checkAdminStatus(email: string) {
  try {
    // Configurar conexão
    if (!process.env.DATABASE_URL) {
      console.error("❌ DATABASE_URL não configurada");
      return;
    }

    const sql = neon(process.env.DATABASE_URL);
    const db = drizzle(sql);

    // Buscar usuário por email
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1);

    if (user.length === 0) {
      console.log(`❌ Usuário "${email}" não encontrado no banco de dados`);
      return;
    }

    const foundUser = user[0];
    console.log(`\n🔍 Informações do usuário "${email}":`);
    console.log(`📧 Email: ${foundUser.email}`);
    console.log(`👤 Nome: ${foundUser.name}`);
    console.log(`🆔 ID: ${foundUser.id}`);
    console.log(`👑 Admin: ${foundUser.isAdmin ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`📅 Criado em: ${foundUser.createdAt}`);
    console.log(`🔄 Atualizado em: ${foundUser.updatedAt}`);

    if (!foundUser.isAdmin) {
      console.log(`\n💡 Para tornar este usuário admin, execute:`);
      console.log(`UPDATE users SET "isAdmin" = true WHERE email = '${email}';`);
    }

  } catch (error) {
    console.error("❌ Erro ao verificar usuário:", error);
  }
}

// Executar verificação
const emailToCheck = process.argv[2] || "leo@dev.com";
console.log(`🔍 Verificando status de admin para: ${emailToCheck}`);

checkAdminStatus(emailToCheck)
  .then(() => {
    console.log("\n✅ Verificação concluída");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Erro:", error);
    process.exit(1);
  });