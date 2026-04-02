import styles from './CubeLoader.module.scss'

export default function CubeLoader() {
  const cubes = []

  for (let h = 1; h <= 3; h++) {
    for (let w = 1; w <= 3; w++) {
      for (let l = 1; l <= 3; l++) {
        cubes.push(
          <div
            key={`h${h}w${w}l${l}`}
            className={`${styles.cube} ${styles[`h${h}`]} ${styles[`w${w}`]} ${styles[`l${l}`]}`}
          >
            <div className={`${styles.face} ${styles.top}`}></div>
            <div className={`${styles.face} ${styles.left}`}></div>
            <div className={`${styles.face} ${styles.right}`}></div>
          </div>
        )
      }
    }
  }

  return <div className={styles.container}>{cubes}</div>
}