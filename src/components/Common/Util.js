import dayjs from 'dayjs';

const formatNumber = (number, decPlaces = 2) => {
    const decSep = '.';
    const thouSep = ',';
    const sign = number < 0 ? '-' : '';
    const numString = String(parseInt(number = Math.abs(Number(number) || 0).toFixed(decPlaces)));
    let commas = numString.length;
    commas = commas > 3 ? commas % 3 : 0;
    const partOne = (commas ? numString.substr(0, commas) + thouSep : '');
    const partTwo = numString.substr(commas).replace(/(\decSep{3})(?=\decSep)/g, '$1' + thouSep);
    const partThree = (decPlaces ? decSep + Math.abs(number - numString).toFixed(decPlaces).slice(2) : '');
    return `${sign}${partOne}${partTwo}${partThree}`;
};

const formatDate = (date) => dayjs(date).format('MMM D YYYY');

const sortDate = (a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1;

export {
    formatNumber,
    formatDate,
    sortDate
};
