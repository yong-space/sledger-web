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

const restrictFormat = (value, allowNegative) => {
    const pattern = allowNegative ? /[^0-9\.\-]/g : /[^0-9\.]/g;
    value = value.replace(pattern, '');
    const dotIndex = value.indexOf('.');
    if (dotIndex >= 0) {
        value = value.slice(0, dotIndex + 3);
    }
    return value;
};

export const numericProps = {
    inputMode: 'numeric',
    pattern: '\-?[0-9]+\.?[0-9]{0,2}',
    onInput: (e) => e.target.value = restrictFormat(e.target.value, false),
};

export const numericPropsNegative = {
    inputMode: 'numeric',
    pattern: '\-?[0-9]+\.?[0-9]{0,2}',
    onInput: (e) => e.target.value = restrictFormat(e.target.value, true),
};
