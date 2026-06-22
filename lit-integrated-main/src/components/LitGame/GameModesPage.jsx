import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[4],
  },
}));

const GameModesPage = () => {
  const gameModes = [
    {
      id: 1,
      title: "Battle Royale",
      description:
        "Compete against players in an intense battle for survival. Be the last one standing to claim victory!",
      image: "/images/game-modes/battle-royale.jpg",
      features: [
        "100 players per match",
        "Dynamic shrinking map",
        "Loot and equipment system",
        "Team or solo play",
      ],
    },
    {
      id: 2,
      title: "Team Deathmatch",
      description:
        "Join forces with your team and eliminate opponents in fast-paced combat scenarios.",
      image: "/images/game-modes/team-deathmatch.jpg",
      features: [
        "5v5 team battles",
        "Multiple maps",
        "Weapon customization",
        "Team coordination",
      ],
    },
    {
      id: 3,
      title: "Capture the Flag",
      description:
        "Strategic gameplay where teams compete to capture the enemy flag while defending their own.",
      image: "/images/game-modes/capture-flag.jpg",
      features: [
        "Team-based objectives",
        "Defensive and offensive roles",
        "Map control strategy",
        "Fast-paced action",
      ],
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography
        variant="h2"
        component="h1"
        align="center"
        gutterBottom
        sx={{ mb: 6 }}
      >
        Game Modes
      </Typography>
      <Grid container spacing={4}>
        {gameModes.map((mode) => (
          <Grid item key={mode.id} xs={12} md={4}>
            <StyledCard>
              <CardMedia
                component="img"
                height="200"
                image={mode.image}
                alt={mode.title}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h5" component="h2">
                  {mode.title}
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  paragraph
                  sx={{ mb: 2 }}
                >
                  {mode.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  {mode.features.map((feature, index) => (
                    <Typography
                      key={index}
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 0.5 }}
                    >
                      • {feature}
                    </Typography>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  sx={{ mt: 2 }}
                >
                  Play Now
                </Button>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default GameModesPage;
