import { withRouter, Link } from 'umi';

import styles from './index.less';

export default withRouter(({ location, children, history }: any) => {
  return (
    <>
      <div className={styles.menuWrapper}>
        <Link to="/">FLIP</Link>
        <Link to="/picture">PIC</Link>
        <Link to="/flip-card">CARD</Link>
      </div>
      {children}
    </>
  );
});
