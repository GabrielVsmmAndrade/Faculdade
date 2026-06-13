/**
 * xmlExporter — converte array de logs MongoDB para XML formatado.
 */
function logsToXml(logs) {
  const escape = (str) =>
    String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const eventos = logs.map((log, i) => {
    const dataHora = log.timestamp
      ? new Date(log.timestamp).toISOString().replace("T", " ").slice(0, 19)
      : "";

    let dadosVinculados = "";
    if (log.tabela || log.registro_id != null) {
      dadosVinculados = `
      <dados_vinculados>
        <tabela>${escape(log.tabela)}</tabela>
        <registro_id>${escape(log.registro_id)}</registro_id>
      </dados_vinculados>`;
    }

    return `
  <evento id="${i + 1}">
    <usuario>${escape(log.usuario)}</usuario>
    <acao>${escape(log.acao)}</acao>
    <descricao>${escape(log.detalhes?.message || log.detalhes || "")}</descricao>
    <data_hora>${dataHora}</data_hora>
    <tipo_evento>${escape(log.acao?.toLowerCase())}</tipo_evento>
    <ip_origem>${escape(log.ip)}</ip_origem>
    <endpoint>${escape(log.endpoint)}</endpoint>
    <metodo>${escape(log.metodo)}</metodo>
    <status_code>${escape(log.status_code)}</status_code>${dadosVinculados}
  </evento>`;
  }).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<logs>${eventos}\n</logs>`;
}

module.exports = { logsToXml };
