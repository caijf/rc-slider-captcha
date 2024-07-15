/**
 * debug: true
 * title: 拼图
 */
import React, { useEffect, useRef } from 'react';
import Jigsaw, { JigsawRefType } from '../Jigsaw';
import { Space } from 'antd';
import ImageBg from './assets/1bg@2x.jpg';
import ImagePuzzle from './assets/1puzzle@2x.png';
import { Status } from '../interface';

function Demo() {
  const jigsawRef1 = useRef<JigsawRefType>(null);
  const jigsawRef2 = useRef<JigsawRefType>(null);
  const jigsawRef3 = useRef<JigsawRefType>(null);
  const jigsawRef4 = useRef<JigsawRefType>(null);
  const jigsawRef5 = useRef<JigsawRefType>(null);
  const jigsawRef6 = useRef<JigsawRefType>(null);
  const jigsawRef7 = useRef<JigsawRefType>(null);
  const jigsawRef8 = useRef<JigsawRefType>(null);

  useEffect(() => {
    jigsawRef4.current?.updateLeft(90);
    jigsawRef5.current?.updateLeft(90);
    jigsawRef6.current?.updateLeft(90);
    jigsawRef7.current?.updateLeft(60);
    jigsawRef8.current?.updateLeft(60);
  }, []);

  return (
    <Space direction="vertical" style={{ display: 'flex' }}>
      <div>
        <p>加载中：</p>
        <Jigsaw
          status={Status.Loading}
          bgUrl={ImageBg}
          puzzleUrl={ImagePuzzle}
          jigsawRef={jigsawRef1}
        />
      </div>
      <div>
        <p>加载失败：</p>
        <Jigsaw
          status={Status.LoadFailed}
          bgUrl={ImageBg}
          puzzleUrl={ImagePuzzle}
          jigsawRef={jigsawRef2}
        />
      </div>
      <div>
        <p>加载成功：</p>
        <Jigsaw
          status={Status.Default}
          bgUrl={ImageBg}
          puzzleUrl={ImagePuzzle}
          jigsawRef={jigsawRef3}
        />
      </div>
      <div>
        <p>移动中：</p>
        <Jigsaw
          status={Status.Moving}
          bgUrl={ImageBg}
          puzzleUrl={ImagePuzzle}
          jigsawRef={jigsawRef4}
        />
      </div>
      <div>
        <p>验证中：</p>
        <Jigsaw
          status={Status.Verify}
          bgUrl={ImageBg}
          puzzleUrl={ImagePuzzle}
          jigsawRef={jigsawRef5}
        />
      </div>
      <div>
        <p>验证成功：</p>
        <Jigsaw
          status={Status.Success}
          bgUrl={ImageBg}
          puzzleUrl={ImagePuzzle}
          jigsawRef={jigsawRef6}
        />
      </div>
      <div>
        <p>验证失败：</p>
        <Jigsaw
          status={Status.Error}
          bgUrl={ImageBg}
          puzzleUrl={ImagePuzzle}
          jigsawRef={jigsawRef7}
        />
      </div>
      <div>
        <p>多次验证失败：</p>
        <Jigsaw
          status={Status.Error}
          bgUrl={ImageBg}
          puzzleUrl={ImagePuzzle}
          jigsawRef={jigsawRef8}
          disabledRefresh
        />
      </div>
    </Space>
  );
}

export default Demo;
