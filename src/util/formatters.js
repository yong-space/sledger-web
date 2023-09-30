import dayjs from 'dayjs';

export const formatDecimal = (value, hideEmpty = true, decimal = 2) => {
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
    if (value === 0 && hideEmpty) {
        return '';
    }
    return numberFomat.format(value);
};

export const formatNumber = (number) => formatDecimal(number, false, 0);

export const formatDate = ({ value }) => !value ? '' : dayjs.utc(value).format('YYYY-MM-DD');

export const formatMonth = ({ value }) => !value ? '' : dayjs.utc(value).format('YYYY MMM');
