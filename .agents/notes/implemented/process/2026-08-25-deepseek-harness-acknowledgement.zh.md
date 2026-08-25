# Agent Note：DeepSeek Harness 致谢

Status: implemented

[English](2026-08-25-deepseek-harness-acknowledgement.md) | 中文

## 问题

本工作流受到 DeepSeek Harness 中可追溯开发实践的启发，但仓库原本没有说明这一影响。缺少清晰声明时，读者无法区分项目的灵感来源与独立实现，也无法确认本项目没有声称官方隶属或背书。

## 决策

英文和中文根 README 末尾包含第 16 节 `Acknowledgements / 致谢`。

英文措辞：

```markdown
This project was inspired by the traceable development practices in [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). It independently adapts those ideas into a reusable Agent Note driven workflow and is not affiliated with or endorsed by DeepSeek.
```

中文措辞：

```markdown
本项目受到 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 中可追溯开发实践的启发，并独立将相关理念整理为一套可复用的 Agent Note 驱动工作流。本项目与 DeepSeek 不存在隶属关系，也不代表 DeepSeek 官方立场或获得其官方背书。
```

该致谢只描述方法论灵感，不声称 fork、代码派生、合作、赞助或背书，也不会复制到下游项目。下游来源标记继续直接指向本仓库。

本致谢与尚未提交的下游来源声明加入同一轮 README 变更和最终提交，但保留独立 Agent Note，因为两者记录的是不同的归属决策。

## 考虑过的替代方案

**只写 `Inspired by DeepSeek Harness`。** 这种写法简洁，但没有明确独立性和非背书关系。

**把项目描述为 based on 或 derived from DeepSeek Harness。** 这些措辞暗示比当前所述方法论启发更强的实现关系。

**把 DeepSeek Harness 加入下游 `AGENTS.md` 来源标记。** 下游项目直接采用的是本工作流而不是 DeepSeek Harness，传递式归属会增加噪声并模糊来源关系。

**增加 NOTICE 或第三方许可证文件。** 仅有方法论启发不需要新增分发产物。如果以后发现复制的代码或实质性文本，必须另行履行其许可证义务。

## 验证

致谢修改两份 README 后、刷新一致性记录前，`node scripts/verify-doc-i18n.mjs` 以 `README.i18n.yaml: translation pair hash mismatch` 失败，证明受管文档门禁检测到了更新。完成双语评审并刷新最终 hash 后，同一命令报告 `Verified 3 bilingual document pair(s).`。

两份 README 各包含恰好一个 `https://github.com/deepseek-ai/deepseek-harness` 链接。两份 README 的 Markdown 诊断均未报告错误，`git diff --check` 未报告空白错误。本项致谢没有修改下游模板内容，也没有修改示例项目、运行时代码、CI 配置或许可证文件。独立人工实施评审接受了结果。

## 后果

读者现在可以确认 DeepSeek Harness 是本项目的方法论灵感来源，同时在同一段中看到本工作流经过独立整理，且与 DeepSeek 不存在隶属或背书关系。该致谢与复制到下游项目的直接来源标记保持分离。

如果致谢被脱离独立性声明单独引用，仍可能被误解为存在关联，因此两个意思保留在同一段。本决策只涵盖方法论灵感；如果以后发现复制或修改的上游材料，它不能替代许可证合规处理。