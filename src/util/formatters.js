import dayjs from 'dayjs';

export const formatDecimal = (value, hideValue = 0, decimal = 2) => {
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

export const formatFx = ({ value }) => formatDecimal(value, 1, 5);
export const formatDecimalAbs = ({ value }) => formatDecimal(Math.abs(value), null);
export const formatDecimalRaw = (number) => formatDecimal(number, null);
export const formatNumber = (number) => formatDecimal(number, 0, 0);
export const formatDate = ({ value }) => !value ? '' : dayjs.utc(value).format('YYYY-MM-DD');
export const formatMonth = ({ value }) => !value ? '' : dayjs.utc(value).format('YYYY MMM');
