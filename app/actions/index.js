"use server";
import { sql } from "drizzle-orm";
import { db } from "../db";
import { clienteTable, processoTable } from "../db/schema";

export const getClientesAction = async () => {
  const clientes = await db.select().from(clienteTable);

  return clientes;
};

export const createClienteAction = async (form) => {
  const tipo = form.get("tipo");
  const nome = form.get("nome");
  const score = form.get("score");

  await db.insert(clienteTable).values({
    tipo,
    score,
    nome,
  });
};

export const createProcessoAction = async (form) => {
  const deferido = form.get("deferido");
  const estado = form.get("estado");
  const clienteId = form.get("clienteId");
  const tipoDeCredito = form.get("tipoDeCredito");

  await db.insert(processoTable).values({
    clienteId,
    deferido,
    tipoDeCredito,
    estado,
  });
};

export const getProcessosAction = async () => {
  const processos = await db.select().from(processoTable);

  return processos;
};
