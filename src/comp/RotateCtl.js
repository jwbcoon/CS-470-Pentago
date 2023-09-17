import {Box, Grid} from "@mui/material";

const RotateCtl = props => {
    const {attrs, onClickHandler} = props;
    const [leftBox, rightBox] = ['counter-clockwise', 'clockwise'];
    return (
        <Grid align='center' justifyContent='space-evenly' sx={{ ...attrs }} container>
            <Grid item
                  xs={2}
                  key={leftBox}
                  onClick={() => onClickHandler(leftBox)}
            >
                <Box sx={{ ...attrs.rotateCtlButtonStyle }}>Counter Clockwise</Box>
            </Grid>
            <Grid item
                  xs={1}
                  key={rightBox}
                  onClick={() => onClickHandler(rightBox)}
            >
                <Box sx={{ ...attrs.rotateCtlButtonStyle }}>Clockwise</Box>
            </Grid>
        </Grid>
    )
}

export { RotateCtl }