import { useEffect, useState, useRef } from 'react';
import { Button } from 'antd';
// @ts-ignore
import { shuffle } from 'lodash';
import styles from './index.less';

let isInit = true;
export default () => {
  const [arr, setArr] = useState([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const [animateFlag, setAnimateFlag] = useState(false);
  const [canGetRes, setCanGetRes] = useState(false);
  const cardRef = useRef<any>();

  const change = () => {
    setAnimateFlag(true);
    [...cardRef.current.children].forEach((item) => {
      const keyframes = [
        {
          transform: 'rotateY(0deg)',
        },
        { transform: 'rotateY(180deg)' },
      ];

      const options = {
        duration: 300,
        easing: 'cubic-bezier(0,0,0.32,1)',
        fill: 'forwards',
      };

      const animate = item.animate(keyframes, options);
      animate.onfinish = () => {
        first();
        // 乱序
        setArr(shuffle(arr));
      };
    });
  };

  const first = () => {
    [...cardRef.current.children].forEach((item) => {
      const { left, top } = item.getBoundingClientRect();
      item.dataset.left = left;
      item.dataset.top = top;
    });
  };

  useEffect(() => {
    return () => {
      isInit = true;
    };
  }, []);

  useEffect(() => {
    if (isInit) {
      isInit = false;
      return;
    }
    [...cardRef.current.children].forEach((item) => {
      // 第二步：Last
      const { left: currentLeft, top: currentTop } =
        item.getBoundingClientRect();
      const { left: oldLeft, top: oldTop } = item.dataset;
      // 第三步：Invert
      const invert = {
        left: oldLeft - currentLeft,
        top: oldTop - currentTop,
      };
      const keyframes = [
        {
          transform: `translate(${invert.left}px, ${invert.top}px) rotateY(180deg)`,
        },
        { transform: 'translate(0, 0)  rotateY(180deg)' },
      ];

      const options = {
        duration: 300,
        easing: 'cubic-bezier(0,0,0.32,1)',
        fill: 'forwards',
      };

      item.animate(keyframes, options);
      setCanGetRes(true);
    });
  }, [arr]);

  return (
    <>
      <Button
        style={{ margin: '10px' }}
        type="primary"
        onClick={change}
        disabled={animateFlag}
      >
        开始
      </Button>
      <div ref={cardRef} className={styles.container}>
        {arr.map((item) => (
          <div
            className={`${styles.cardBox}`}
            key={item}
            onClick={(e) => {
              if (!canGetRes) return;
              const res = prompt('请输入数字');
              [...cardRef.current.children].forEach((item) => {
                const keyframes = [
                  {
                    transform: 'rotateY(180deg)',
                  },
                  { transform: 'rotateY(0deg)' },
                ];

                const options = {
                  duration: 300,
                  easing: 'cubic-bezier(0,0,0.32,1)',
                  fill: 'forwards',
                };

                item.animate(keyframes, options);
              });
              setCanGetRes(false);
              setAnimateFlag(false);
              // @ts-ignore
              alert(`回答【${item == res ? '正确' : '错误'}】`);
            }}
          >
            <div className={styles.front}>{item}</div>
            <div className={styles.back}>背面</div>
          </div>
        ))}
      </div>
    </>
  );
};
