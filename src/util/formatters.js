import dayjs from 'dayjs';

const processFormatDecimal = (value, hideValue = null, decimal = 2) => {
    const numberStyle = {
        style: 'decimal',
        minimumFractionDigits: decimal,
        maximumFractionDigits: decimal,
    };
    const numberFomat = new Intl.NumberFormat('en', numberStyle);

    switch (typeof value) {
        case 'object': value = value.value; break;
        case 'undefined': value = 0; break;
    }

    if (!value) {
        value = 0;
    } else if (typeof value === 'object') {
        value = value.value;
    }
    if (Number(value) === hideValue) {
        return '';
    }
    return numberFomat.format(value);
};

export const formatDecimal = (value) => processFormatDecimal(value);
export const formatDecimalHideZero = (value) => processFormatDecimal(value, 0);
export const formatFx = (value) => processFormatDecimal(value, 1, 5);
export const formatDecimalAbs = (value) => processFormatDecimal(Math.abs(value));
export const formatNumber = (value) => processFormatDecimal(value, 0, 0);
export const formatDate = (value) => !value ? '' : dayjs.utc(value).format('YYYY-MM-DD');
export const formatMonth = (value) => !value ? '' : dayjs.utc(value).format('YYYY MMM');
