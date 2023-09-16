
const arrayDims = {
    x: 6,
    y: 6
};

const cellStyleVariants = {
    empty: {
        backgroundColor: '#757575',
            color: '#fafafa',
            borderColor: '#757575'
    },
    firstPl: {
        backgroundColor: '#81d4fa',
            color: '#fafafa',
            borderColor: '#81d4fa'
    },
    secondPl: {
        backgroundColor: '#ffcc80',
            color: '#fafafa',
            borderColor: '#ffcc80'
    },
    win: {
        backgroundColor: '#3bc270',
            color: '#fafafa',
            borderColor: '#3bc270'
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