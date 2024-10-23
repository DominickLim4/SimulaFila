"use client";

import { useState, useEffect } from "react";
import {
  createClienteAction,
  createProcessoAction,
  getClientesAction,
} from "./actions";
import Link from "next/link";

export default function Home() {
  const [clientes, setClientes] = useState([]);
  const [clienteData, setClienteData] = useState({
    nome: "",
    tipo: "",
    score: "",
  });
  const [processoData, setProcessoData] = useState({
    estado: "",
    tipoDeCredito: "",
    deferido: "",
    clienteId: "",
  });

  const getClientes = async () => {
    try {
      const data = await getClientesAction();
      setClientes(data);
    } catch (error) {
      console.error("Error fetching clientes:", error);
    }
  };

  useEffect(() => {
    getClientes();
  }, []);

  // Função para converter valores para strings
  const toString = (value) => {
    return value !== null && value !== undefined ? String(value) : "";
  };

  // Seção de Cálculo de Filas M/M/c
  const [c, setC] = useState("");
  const [lambdaValue, setLambdaValue] = useState("");
  const [unidadeLambda, setUnidadeLambda] = useState("Hora");
  const [mu, setMu] = useState("");
  const [unidadeMu, setUnidadeMu] = useState("Hora");
  const [calculoSelecionado, setCalculoSelecionado] = useState(
    "Tempo médio de espera na fila"
  );
  const [resultado, setResultado] = useState(null);
  const [unidadeResultado, setUnidadeResultado] = useState("");

  useEffect(() => {
    calcular();
  }, [c, lambdaValue, unidadeLambda, mu, unidadeMu, calculoSelecionado]);

  const calcular = () => {
    const cValue = parseInt(c);
    let lambda = parseFloat(lambdaValue);
    let muValue = parseFloat(mu);

    // Verifica se os valores são válidos
    if (
      isNaN(cValue) ||
      isNaN(lambda) ||
      isNaN(muValue) ||
      cValue <= 0 ||
      lambda <= 0 ||
      muValue <= 0
    ) {
      setResultado(null);
      return;
    }

    // Ajusta as unidades de lambda e mu se necessário
    if (unidadeLambda === "Minuto") {
      lambda = lambda / 60;
    }
    if (unidadeMu === "Minuto") {
      muValue = muValue / 60;
    }

    const rho = lambda / (cValue * muValue);

    if (rho >= 1) {
      alert(
        "A taxa de ocupação não pode ser maior ou igual a 1, pois implica um sistema instável."
      );
      setResultado(null);
      return;
    }

    // Função para calcular P0
    const factorial = (n) => {
      return n <= 1 ? 1 : n * factorial(n - 1);
    };

    const calc_p0 = (c, rho) => {
      let sumTerms = 0;
      for (let n = 0; n < c; n++) {
        sumTerms += Math.pow(c * rho, n) / factorial(n);
      }
      const lastTerm = Math.pow(c * rho, c) / (factorial(c) * (1 - rho));
      return 1 / (sumTerms + lastTerm);
    };

    const p0 = calc_p0(cValue, rho);
    const Lq =
      (p0 * Math.pow(cValue * rho, cValue) * rho) /
      (factorial(cValue) * Math.pow(1 - rho, 2));
    const L = Lq + cValue * rho;
    const Wq = Lq / lambda;
    const W = Wq + 1 / muValue;

    let res = null;
    let unidade = "";

    switch (calculoSelecionado) {
      case "Taxa de ocupação":
        res = rho * 100;
        unidade = "%";
        break;
      case "Probabilidade de ter fila":
        res = p0 * 100;
        unidade = "%";
        break;
      case "Número médio de clientes na fila":
        res = Lq;
        unidade = "clientes";
        break;
      case "Número médio de clientes no sistema":
        res = L;
        unidade = "clientes";
        break;
      case "Tempo médio de espera na fila":
        res = Wq * 60; // Converte para minutos
        unidade = "minutos";
        break;
      case "Tempo gasto no sistema":
        res = W * 60; // Converte para minutos
        unidade = "minutos";
        break;
      default:
        break;
    }

    setResultado(res);
    setUnidadeResultado(unidade);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-blue-600 text-white py-4">
        <div className="container mx-auto flex justify-between items-center px-6">
          <h1 className="text-2xl font-bold">SimulaFila</h1>
          <nav className="space-x-4">
            <Link href="/" className="hover:underline">
              Início
            </Link>
            <Link href="/clientes" className="hover:underline">
              Clientes
            </Link>
            <Link href="/processos" className="hover:underline">
              Processos
            </Link>
            <Link href="/simulador" className="hover:underline">
              Simulador de Filas
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-grow">
        <div className="container mx-auto p-8">
          {/* Organização dos blocos em colunas centralizadas */}
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Cadastro de Cliente */}
              <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Cadastro de Cliente</h2>
                <form action={createClienteAction} className="space-y-4">
                  <input
                    name="nome"
                    type="text"
                    placeholder="Nome"
                    value={clienteData.nome}
                    onChange={(e) =>
                      setClienteData({
                        ...clienteData,
                        nome: toString(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <select
                    name="tipo"
                    value={clienteData.tipo}
                    onChange={(e) =>
                      setClienteData({
                        ...clienteData,
                        tipo: toString(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Selecione o Tipo</option>
                    <option value="Micro">Micro</option>
                    <option value="Pequeno">Pequeno</option>
                    <option value="Pequeno/Médio">Pequeno/Médio</option>
                    <option value="Médio">Médio</option>
                    <option value="Grande">Grande</option>
                  </select>
                  <input
                    name="score"
                    type="text"
                    placeholder="Score"
                    value={clienteData.score}
                    onChange={(e) =>
                      setClienteData({
                        ...clienteData,
                        score: toString(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded w-full"
                  >
                    Adicionar Cliente
                  </button>
                </form>
              </div>

              {/* Cadastro de Processo */}
              <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Cadastro de Processo</h2>
                <form action={createProcessoAction} className="space-y-4">
                  <select
                    name="clienteId"
                    value={processoData.clienteId}
                    onChange={(e) =>
                      setProcessoData({
                        ...processoData,
                        clienteId: toString(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Selecione um Cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                  <select
                    name="estado"
                    value={processoData.estado}
                    onChange={(e) =>
                      setProcessoData({
                        ...processoData,
                        estado: toString(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Selecione o Estado</option>
                    <option value="AC">Acre</option>
                    <option value="AL">Alagoas</option>
                    <option value="AP">Amapá</option>
                    <option value="AM">Amazonas</option>
                    <option value="BA">Bahia</option>
                    <option value="CE">Ceará</option>
                    <option value="DF">Distrito Federal</option>
                    <option value="ES">Espírito Santo</option>
                    <option value="GO">Goiás</option>
                    <option value="MA">Maranhão</option>
                    <option value="MT">Mato Grosso</option>
                    <option value="MS">Mato Grosso do Sul</option>
                    <option value="MG">Minas Gerais</option>
                    <option value="PA">Pará</option>
                    <option value="PB">Paraíba</option>
                    <option value="PR">Paraná</option>
                    <option value="PE">Pernambuco</option>
                    <option value="PI">Piauí</option>
                    <option value="RJ">Rio de Janeiro</option>
                    <option value="RN">Rio Grande do Norte</option>
                    <option value="RS">Rio Grande do Sul</option>
                    <option value="RO">Rondônia</option>
                    <option value="RR">Roraima</option>
                    <option value="SC">Santa Catarina</option>
                    <option value="SP">São Paulo</option>
                    <option value="SE">Sergipe</option>
                    <option value="TO">Tocantins</option>
                  </select>
                  <input
                    name="tipoDeCredito"
                    type="text"
                    placeholder="Tipo de Crédito"
                    value={processoData.tipoDeCredito}
                    onChange={(e) =>
                      setProcessoData({
                        ...processoData,
                        tipoDeCredito: toString(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  />
                  <select
                    name="deferido"
                    value={processoData.deferido}
                    onChange={(e) =>
                      setProcessoData({
                        ...processoData,
                        deferido: toString(e.target.value),
                      })
                    }
                    className="w-full p-2 border rounded"
                  >
                    <option value="">Selecione se Deferido</option>
                    <option value="Sim">Sim</option>
                    <option value="Não">Não</option>
                  </select>
                  <button
                    type="submit"
                    className="bg-green-500 text-white p-2 rounded w-full"
                  >
                    Adicionar Processo
                  </button>
                </form>
              </div>

              {/* Simulador de Filas */}
              <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">
                  Simulador de Filas
                </h2>
                {/* Inputs */}
                <div className="space-y-4">
                  <input
                    type="number"
                    min="1"
                    max="999"
                    step="1"
                    placeholder="Número de servidores"
                    value={c}
                    onChange={(e) => setC(e.target.value)}
                    className="w-full p-2 border rounded"
                  />
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      step="1"
                      placeholder="Taxa de chegada de clientes"
                      value={lambdaValue}
                      onChange={(e) => setLambdaValue(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <select
                      value={unidadeLambda}
                      onChange={(e) => setUnidadeLambda(e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="Hora">Hora</option>
                      <option value="Minuto">Minuto</option>
                    </select>
                  </div>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      min="1"
                      max="999"
                      step="1"
                      placeholder="Taxa de atendimentos"
                      value={mu}
                      onChange={(e) => setMu(e.target.value)}
                      className="w-full p-2 border rounded"
                    />
                    <select
                      value={unidadeMu}
                      onChange={(e) => setUnidadeMu(e.target.value)}
                      className="p-2 border rounded"
                    >
                      <option value="Hora">Hora</option>
                      <option value="Minuto">Minuto</option>
                    </select>
                  </div>
                  <select
                    value={calculoSelecionado}
                    onChange={(e) => setCalculoSelecionado(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Tempo médio de espera na fila">
                      Tempo médio de espera na fila
                    </option>
                    <option value="Número médio de clientes na fila">
                      Número médio de clientes na fila
                    </option>
                    <option value="Número médio de clientes no sistema">
                      Número médio de clientes no sistema
                    </option>
                    <option value="Taxa de ocupação">Taxa de ocupação</option>
                    <option value="Probabilidade de ter fila">
                      Probabilidade de ter fila
                    </option>
                    <option value="Tempo gasto no sistema">
                      Tempo gasto no sistema
                    </option>
                  </select>
                </div>

                {/* Resultado */}
                {resultado !== null && (
                  <div className="mt-6">
                    <h3 className="text-lg font-bold">Resultado</h3>
                    <div className="bg-gray-50 p-4 rounded shadow-inner">
                      <p className="text-center text-xl">
                        {calculoSelecionado}:{" "}
                        <span className="text-blue-500 font-semibold">
                          {resultado.toFixed(2)} {unidadeResultado}
                        </span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documentação */}
          <div className="mt-12">
            <h1 className="text-2xl font-bold mb-4">Documentação</h1>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Cadastro de Cliente</h2>
              <p className="text-gray-700">
                O módulo permite adicionar
                novos clientes ao sistema. Para cadastrar um cliente, preencha o
                formulário com o nome, selecione o tipo de cliente e insira o score.
                Clique em <em>"Adicionar Cliente"</em>. O cliente será salvo no banco
                de dados e poderá ser selecionado ao criar um novo processo.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Cadastro de Processo</h2>
              <p className="text-gray-700">
                O módulo permite associar um
                processo a um cliente existente. Selecione o cliente desejado na
                lista, escolha o estado, insira o tipo de crédito, selecione se foi
                deferido ou não, e clique em <em>"Adicionar Processo"</em>. O
                processo será vinculado ao cliente selecionado.
              </p>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-2">Simulador de Filas</h2>
              <p className="text-gray-700">
                O <strong>Simulador de Filas</strong> permite calcular métricas
                importantes de um sistema de filas como tempo médio de espera,
                número médio de clientes na fila, taxa de ocupação, entre outros.
                Insira os parâmetros necessários:
              </p>
              <ul className="list-disc list-inside text-gray-700">
                <li>
                  <strong>Número de servidores:</strong> Quantidade de atendentes
                  ou canais disponíveis
                </li>
                <li>
                  <strong>Taxa de chegada de clientes:</strong> Média de clientes
                  que chegam por unidade de tempo
                </li>
                <li>
                  <strong>Taxa de atendimentos:</strong> Média de clientes
                  atendidos por um servidor por unidade de tempo
                </li>
                <li>
                  <strong>Cálculo desejado:</strong> Selecione a métrica que deseja
                  calcular
                </li>
              </ul>
              <p className="text-gray-700 mt-2">
                Após inserir os dados, o resultado será exibido abaixo do simulador.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-200 text-center py-4">
        <p>© 2023 SimulaFila. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
