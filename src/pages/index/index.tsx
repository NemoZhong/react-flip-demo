import { useLayoutEffect, useState, useRef } from 'react';
import { Button } from 'antd';
import styles from './index.less';

// 元素位置数组
let transArr: any[] = [];
// 计算需要动的元素列表
let activeList: any[] = [];
// 从哪个位置插入元素
let animateIndex = 0;

// updateStatus增加0  删除1
let updateStatus = 0;

// 生成一个二维数组
function getArrByLen(len: number) {
  return Array(len)
    .fill(0)
    .map(() => [0, 0]);
}

export default () => {
  const [list, setList] = useState<{ id: string; name: string }[]>([
    { id: '0', name: '1' },
  ]);
  // 0 first  1 last 2 invert 3 play
  const [animateStatus, setAnimateStatus] = useState(0);
  const containerRef = useRef<any>();

  useLayoutEffect(() => {
    if (animateStatus === 1) {
      const stepIndex = updateStatus === 0 ? 1 : 0;

      activeList.forEach((itemEle, index) => {
        // last   dom改变了，浏览器还没渲染
        const { left, top } = itemEle.getBoundingClientRect();
        // invert
        transArr[index + stepIndex][0] = transArr[index + stepIndex][0] - left;
        transArr[index + stepIndex][1] = transArr[index + stepIndex][1] - top;
      });
      setAnimateStatus(2);
    } else if (animateStatus === 2) {
      // last 位置
      transArr = getArrByLen(list.length);
      setTimeout(() => {
        // Play
        setAnimateStatus(3);
      }, 16);
    }
  }, [animateStatus, list]);

  const first = (index = 0, type = 'add') => {
    animateIndex = index;
    // 删除需要动画的元素为index+1 之后的元素
    activeList = [...containerRef.current.children].slice(
      index + (type === 'add' ? 0 : 1),
    );

    const stepIndex = type === 'add' ? 1 : 0;
    // updateStatus增加0  删除1
    updateStatus = type === 'add' ? 0 : 1;
    transArr = getArrByLen(activeList.length + stepIndex);
    // First
    activeList.forEach((itemEle, index) => {
      const { left, top } = itemEle.getBoundingClientRect();
      transArr[index + stepIndex][0] = left;
      transArr[index + stepIndex][1] = top;
    });

    setAnimateStatus(1);
  };

  const addFn = () => {
    first();
    const newList = [...list];
    newList.unshift({
      id: String(+new Date()),
      name: String(newList.length + 1),
    });
    setList(newList);
  };
  const delFn = (id: string) => {
    const newList = [...list];
    const idx = newList.findIndex((it) => it.id === id);
    first(idx, 'del');
    updateStatus = 1;
    setList(newList.filter((item) => item.id !== id));
  };
  return (
    <>
      <Button style={{ margin: '10px' }} type="primary" onClick={addFn}>
        add
      </Button>
      <div ref={containerRef} className={styles.cardContainer}>
        {list.map((item, index) => (
          <div
            key={item.id}
            style={{
              // 操作的元素及后面的元素均发生变化
              ...(index >= animateIndex && animateStatus > 1
                ? {
                    transform: `translate(${
                      transArr[index - animateIndex][0]
                    }px, ${transArr[index - animateIndex][1]}px)`,
                  }
                : {}),
            }}
            className={`${styles.card} ${
              animateStatus === 3 ? styles.active : ''
            }`}
          >
            {item.name}
            <span className={styles.del} onClick={() => delFn(item.id)}>
              x
            </span>
          </div>
        ))}
      </div>
    </>
  );
};
