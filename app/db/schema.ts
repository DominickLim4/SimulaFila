import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const clienteTable = sqliteTable("cliente", {
  id: integer("id", { mode: "number" })
    .notNull()
    .primaryKey({ autoIncrement: true }),
  tipo: text("tipo"),
  score: text("score"),
  nome: text("nome"),
});

export const processoTable = sqliteTable("processo", {
  id: integer("id", { mode: "number" })
    .notNull()
    .primaryKey({ autoIncrement: true }),
  estado: text("estado"),
  tipoDeCredito: text("tipoDeCredito"),
  deferido: text("deferido"),
  clienteId: integer("clienteId", { mode: "number" })
    .notNull()
    .references(() => clienteTable.id),
  status: integer("status").default(1),
});
