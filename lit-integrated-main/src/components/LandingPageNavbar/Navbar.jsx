import React, { useState, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  ShoppingCartOutlined as ShoppingCartOutlinedIcon,
  FavoriteBorderOutlined as FavoriteBorderOutlinedIcon,
} from "@mui/icons-material";
import "./Navbar.css";
import logoImage from "../../assets/logo.png?url";
import notificationIcon from "../../assets/notification-icon.svg?url";
import { useSelector } from "react-redux"; // Import useSelector

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const cartItems = useSelector((state) => state.cart.cart); // Access cart from Redux store
  const totalCartItems = cartItems.reduce(
    (acc, item) => acc + item.quantity,
    0,
  ); // Calculate total quantity

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const menuItems = [
    { text: "Game Modes", path: "/game-modes" },
    { text: "Marketplace", path: "/shop" },

    { text: "Socials", path: "/#" },
    { text: "Newsletter", path: "/newsletter" },
    { text: "Avatar Store", path: "/#" },
    { text: "IR icon", path: "#" },
  ];

  const renderMobileMenu = (
    <Drawer anchor="left" open={mobileMenuOpen} onClose={toggleMobileMenu}>
      <List>
        <ListItem>
          <img
            src={logoImage}
            alt="Logo"
            style={{ height: "32px", width: "auto" }}
          />
        </ListItem>
        <Divider />
        {menuItems.map((item) => (
          <ListItem key={item.text} onClick={toggleMobileMenu}>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );

  return (
    <AppBar
      position="fixed"
      elevation={0}
      className={`navbar ${scrolled ? "scrolled" : ""}`}
      sx={{
        width: "100%",
        color: "white",
        backgroundColor: "transparent",
        boxShadow: "none",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <Toolbar
        sx={{
          alignItems: "center",
          padding: isMobile ? "0 1rem" : "0 2rem",
          minHeight: "60px !important",
        }}
      >
        {isMobile ? (
          <>
            <RouterLink to="/">
              <img
                src={logoImage}
                alt="Logo"
                style={{ height: "32px", width: "auto" }}
              />
            </RouterLink>
            <Box className="mobile-nav-icons">
              <IconButton color="inherit">
                <img
                  src={notificationIcon}
                  alt="Notifications"
                  style={{ width: "24px", height: "24px" }}
                />
              </IconButton>
              <button
                className={`mobile-menu-btn${mobileMenuOpen ? " open" : ""}`}
                aria-label="Toggle menu"
                onClick={toggleMobileMenu}
              >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
            </Box>
            <nav className={`mobile-menu${mobileMenuOpen ? " open" : ""}`}>
              <div className="mobile-menu-header">
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{ height: "32px", width: "auto" }}
                />
              </div>
              <div className="mobile-nav-links">
                {menuItems.map((item) => (
                  <RouterLink
                    key={item.text}
                    to={item.path}
                    className="nav-link"
                    onClick={toggleMobileMenu}
                  >
                    {item.text}
                  </RouterLink>
                ))}
              </div>
            </nav>
          </>
        ) : (
          <>
            {" "}
            {/* Fragment to group left and right sections for desktop */}
            {/* Left side: Logo and Navigation Links */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <RouterLink to="/">
                <img
                  src={logoImage}
                  alt="Logo"
                  style={{ height: "40px", width: "auto", marginRight: "2rem" }}
                />
              </RouterLink>
              <Box sx={{ display: "flex", alignItems: "center", gap: "3rem" }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    color="inherit"
                    component={RouterLink}
                    to={item.path}
                    sx={{
                      color: "white",
                      fontSize: "16px",
                      textTransform: "capitalize",
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        width: "0%",
                        height: "2px",
                        bottom: "-4px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background:
                          "linear-gradient(85.68deg, #9333ea, #fffefe)",
                        transition: "width 0.3s ease-in-out",
                      },
                      "&:hover::after": {
                        width: "100%",
                      },
                      "&.active::after": {
                        width: "100%",
                      },
                    }}
                  >
                    {item.text}
                  </Button>
                ))}
              </Box>
            </Box>
            {/* Right side: Icons */}
            <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <IconButton color="inherit" component={RouterLink} to="/wishlist">
                <FavoriteBorderOutlinedIcon />
                {/* You can add a wishlist count here if needed */}
              </IconButton>
              <IconButton color="inherit" component={RouterLink} to="/cart">
                <ShoppingCartOutlinedIcon />
                {totalCartItems > 0 && (
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      backgroundColor: "#9333ea",
                      borderRadius: "50%",
                      width: 16,
                      height: 16,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: "bold",
                      color: "white",
                    }}
                  >
                    {totalCartItems}
                  </Typography>
                )}
              </IconButton>
              <IconButton color="inherit">
                <img
                  src={notificationIcon}
                  alt="Notifications"
                  style={{ width: "24px", height: "24px" }}
                />
              </IconButton>
            </Box>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
