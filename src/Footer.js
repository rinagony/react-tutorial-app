
function Footer() {
  const today = new Date();
    return (
      <footer className="Footer">
        <p>Cipyright &copy; {today.getFullYear()}</p>
      </footer>
    );
  }
  
  export default Footer;
  