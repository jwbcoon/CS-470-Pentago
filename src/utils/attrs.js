import {green, grey, lightBlue, orange} from '@mui/material/colors'

const arrayDims = {
    x: 6,
    y: 6
};

const cellAttrs =  {
    width: '20px',
    height: '20px',
    styles: {
        empty: {
            backgroundColor: grey[500],
            color: grey[50],
            borderColor: grey[500]
        },
        firstPl: {
            backgroundColor: lightBlue[200],
            color: grey[50],
            borderColor: lightBlue[200]
        },
        secondPl: {
            backgroundColor: orange[200],
            color: grey[50],
            borderColor: orange[200]
        },
        win: {
            backgroundColor: green[400],
            color: grey[50],
            borderColor: green[400]
        }
    }
};

const quadAttrs = {
    cells: [],
    columns: 3,
    width: '100%',
    height: '100%',
    cellAttrs: cellAttrs
};

const boardAttrs =  {
    columns: 2,
    width: '100%',
    height: '100%'
};

const attributes = {
    boardAttrs: {...boardAttrs},
    quadAttrs: {...quadAttrs},
    cellAttrs: {...cellAttrs}
};

export {
    arrayDims,
    boardAttrs,
    quadAttrs,
    cellAttrs,
    attributes
};