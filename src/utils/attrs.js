
const arrayDims = {
    x: 6,
    y: 6
};

const rotateCtlButtonStyle = {
    width: 250,
    height: 80,
    borderWidth: 1,
    color: '#fafafa',
    backgroundColor: '#082837',
    borderColor: '#81d4fa',
    borderRadius: '0.5em'
};

const rotateCtlAttrs = {
    paddingRight: 20,
    direction:'row',
    gap: 10,
    rotateCtlButtonStyle: rotateCtlButtonStyle
};

const cellStyleVariants = {
    empty: {
        backgroundColor: '#757575',
            color: '#fafafa',
            borderColor: '#757575',
            borderRadius: '2em'
    },
    firstPl: {
        backgroundColor: '#81d4fa',
            color: '#fafafa',
            borderColor: '#81d4fa',
            borderRadius: '2em'
    },
    secondPl: {
        backgroundColor: '#ffcc80',
            color: '#fafafa',
            borderColor: '#ffcc80',
            borderRadius: '2em'
    },
    win: {
        backgroundColor: '#3bc270',
            color: '#fafafa',
            borderColor: '#3bc270',
            borderRadius: '2em'
    },
    invalid: {
        backgroundColor: '#F60707B5',
            color: '#fafafa',
            borderColor: '#F60707B5',
            styleMemory: '#F60707B5'
    }
}

const cellAttrs =  {
    width: 50,
    height: 50,
    style: cellStyleVariants.empty
};

const quadAttrs = {
    columns: arrayDims.x / 2,
    width: 250,
    height: 250,
    direction: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#784115',
    color: '#6d1016',
    borderColor: '#784115',
    borderRadius: '1em'
};

const boardAttrs =  {
    columns: arrayDims.y / quadAttrs.columns,
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
    rotateCtlAttrs,
    rotateCtlButtonStyle,
    cellStyleVariants,
    boardAttrs,
    quadAttrs,
    cellAttrs,
    attributes
};