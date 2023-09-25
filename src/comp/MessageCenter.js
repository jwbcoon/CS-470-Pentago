import {Container, Typography} from "@mui/material";

const MessageCenter = props => { //component for containing text which updates with notifications for the player
    const {message} = props;
    return (
        <Container
            sx={{
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Typography sx={{ color: message.color, textAlign: 'center' }}>
                {message.text}
            </Typography>
        </Container>
    )
};

export { MessageCenter };
