export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="site-footer-in">
        <span>&copy; {year} MARS Solutions Group</span>
        <span>
          <a href="https://www.marssg.com/privacy-policy">Privacy Policy</a>
          &nbsp;&nbsp;
          <a href="https://www.marssg.com/terms-of-use">Terms of Use</a>
        </span>
      </div>
    </footer>
  );
}
