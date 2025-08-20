"use client";
import CardNav from './UI/CardNav'


const Navbar = () => {
  const items = [
    {
      label: "Events",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Egnes25", ariaLabel: "About Company", href: "/event" },
        { label: "On Going Events", ariaLabel: "About Careers", href: "#"  }
      ]
    },
    {
      label: "About",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "Company", ariaLabel: "About Company", href: "/event" },
        { label: "Careers", ariaLabel: "About Careers", href: "#"  }
      ]
    },
    {
      label: "Projects", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Featured", ariaLabel: "Featured Projects", href: "#" },
        { label: "Case Studies", ariaLabel: "Project Case Studies", href: "#" }
      ]
    }
  ];

  return (
    <CardNav
      logo="/edit.png"
      logoAlt="Company Logo"
      items={items}
      baseColor="#5e5e5e"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
    />
  );
};


export default Navbar;