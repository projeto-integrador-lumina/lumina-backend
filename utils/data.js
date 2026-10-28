const TZ = "America/Sao_Paulo";
const NOMES = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"];

export const diaLocal = (data) => new Date(data).toLocaleDateString("en-CA", { timeZone: TZ }); 
export const hojeLocal = () => diaLocal(new Date());

const meioDia = (iso) => new Date(iso + "T12:00:00Z");

export const somaDias = (iso, n) => {
    const d = meioDia(iso);
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
};

export const nomeDoDia = (iso) => NOMES[meioDia(iso).getUTCDay()];
export const segundaDaSemana = (iso) => somaDias(iso, -((meioDia(iso).getUTCDay() + 6) % 7));

export const inicioDoDia = (iso) => new Date(iso + "T00:00:00-03:00");

export const idade = (nascimento) => {
    const n = new Date(nascimento);
    const h = new Date();
    let anos = h.getUTCFullYear() - n.getUTCFullYear();
    const antes = h.getUTCMonth() < n.getUTCMonth() ||
        (h.getUTCMonth() === n.getUTCMonth() && h.getUTCDate() < n.getUTCDate());
    if (antes) anos--;
    return anos;
};

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const dataValida = (iso) => ISO.test(iso) && !Number.isNaN(meioDia(iso).getTime()) && somaDias(iso, 0) === iso;

export const lerPeriodo = (query) => {
    const ate = query.ate || hojeLocal();
    const de = query.de || somaDias(ate, -29);

    if (!dataValida(de) || !dataValida(ate)) {
        return { erro: "Datas inválidas. Use o formato AAAA-MM-DD." };
    }
    if (de > ate) return { erro: "A data inicial não pode ser maior que a final." };
    if (somaDias(de, 366) < ate) return { erro: "O período máximo é de 366 dias." };

    return { de, ate, inicio: inicioDoDia(de), fim: inicioDoDia(somaDias(ate, 1)) };
};
