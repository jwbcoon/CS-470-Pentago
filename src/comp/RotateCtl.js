import {Box, Grid} from "@mui/material";
import {clickRotate} from "../actions";

const RotateCtl = props => { //Component for button controls to rotate the pentago quads
    const {attrs, dispatch} = props;
    const [leftBox, rightBox] = ['counter-clockwise', 'clockwise'];
    return (
        <Grid align='center' justifyContent='space-evenly' sx={{ ...attrs }} container>
            <Grid item
                  xs={2}
                  key={leftBox}
                  onClick={ () => dispatch(clickRotate(leftBox)) }
            >
                <Box sx={{ ...attrs.rotateCtlButtonStyle }}>Counter Clockwise</Box>
            </Grid>
            <Grid item
                  xs={1}
                  key={rightBox}
                  onClick={ () => dispatch(clickRotate(rightBox)) }
            >
                <Box sx={{ ...attrs.rotateCtlButtonStyle }}>Clockwise</Box>
            </Grid>
        </Grid>
    )
}

export { RotateCtl }