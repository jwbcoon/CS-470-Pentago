import {green, grey, lightBlue, orange} from '@mui/material/colors'

const arrayDims = {
    x: 6,
    y: 6
};

const cellStyleVariants = {
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

const cellAttrs =  {
    width: 50,
    height: 50,
    style: cellStyleVariants.empty
};

const quadAttrs = {
    columns: 3,
    width: 250,
    height: 250,
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#784115',
    color: '#6d1016',
    borderColor: '#784115'
};

const boardAttrs =  {
    columns: 2,
    width: 550,
    height: 550,
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'center'
};

const attributes = {
    boardAttrs: {...boardAttrs},
    quadAttrs: {...quadAttrs},
    cellAttrs: {...cellAttrs}
};

export {
    arrayDims,
    cellStyleVariants,
    boardAttrs,
    quadAttrs,
    cellAttrs,
    attributes
};