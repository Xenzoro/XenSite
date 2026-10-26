import Image from "next/image";
import logo from "@/assets/logo.webp";
import HideOnScroll from "./HideOnScroll";
import MenuToggle from "./MenuToggle";
import NavLinks from "./NavLinks";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <header>
      <HideOnScroll>
        <div className={styles.liquidContainer}>
          <div className={styles.logoContainer}>
            <Image src={logo} alt="Jacob Martinez logo" width={100} height={100} loading="eager" className={styles.logo} />
          </div>
          <NavLinks />
        </div>
      </HideOnScroll>
      <MenuToggle>
        <NavLinks />
      </MenuToggle>
    </header>
  );
}
