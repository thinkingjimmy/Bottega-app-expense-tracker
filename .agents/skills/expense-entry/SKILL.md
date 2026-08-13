---
name: expense-entry
displayName: 记账录入
description: 把自然语言的开销、账单、报销或对账请求写入记账本 Base，并按分类与日期回答统计问题。
requires: tools: bases:mutate
---

# 记账录入

Base 作用域已由当前 chat 的 lease 固定，不要猜 owner，也不要新建 Base。
基础操作（`base_describe` 先行、`expected_revision`、409 重读、分页游标）遵循
base-ops skill，本文只定义记账本自己的约定。

## 列契约

| 列 id | 类型 | 写入规则 |
| --- | --- | --- |
| `date` | date | `YYYY-MM-DD`。用户说「今天/昨天/上周五」时先换算成绝对日期，不写相对词。没说日期就用今天。 |
| `amount` | number | 只写数字，不带货币符号。支出为正数；退款、报销到账写负数，并在 `note` 里点明。 |
| `category` | select | 写 **option id** 而不是中文标签：`food` `transport` `shopping` `housing` `health` `entertainment` `other`。 |
| `note` | text | 保留用户原话里的关键信息（商家、事由、同行人），一句话以内，不要复述整条输入。 |

分类判断不确定时归 `other` 并在 `note` 里留原词，不要为了「看起来齐整」硬塞进某一类；
用户明确纠正后按纠正结果 patch。

## 录入协议

1. 先 `base_describe` 读到 `revision` 与列 schema，确认 `category` 的 option id 集合。
2. 行 id 用 `e-{YYYYMMDD}-{当日序号}`（如 `e-20260306-2`）。同日多笔时先
   `base_query`（filter `date = 该日`）数出已有条数再编号，天然幂等、不会撞号。
3. 一次输入含多笔（「早饭 12 午饭 25」）就一次 `base_insert_rows` 批量写入，
   不要一笔一次调用。
4. 写完回一行确认：日期、金额、分类标签、当前这一天的合计。

## 改账与查询

- 改已有记录用 `base_patch_rows`（字段级 LWW）；先 `base_query` 定位行 id，不凭记忆猜。
- 用户说「记错了/删掉刚才那笔」时，确认到具体行再 `base_delete_rows`，一次只删确认过的行。
- 统计问题（本月餐饮多少、哪天花得最多）一律 `base_query` 取数后自己算，
  不要凭上下文里的历史消息回答——账本才是真相。
- 完整导出用 `base_export_csv`，返回的是 artifact 元数据而不是内联 CSV 正文。

## 示例

输入「昨天打车 38，晚上吃饭 66，和同事 AA 我付的」（今天是 2026-03-07）：

```
base_insert_rows rows=[
  { id: "e-20260306-1", values: { date: "2026-03-06", amount: 38, category: "transport", note: "打车" } },
  { id: "e-20260306-2", values: { date: "2026-03-06", amount: 66, category: "food", note: "与同事聚餐，我先垫付" } }
]
```

回复：「已记 2026-03-06 两笔：交通 38、餐饮 66，当日合计 104。」

## 不做的事

- 不删列、不改已有列类型、不改 select 的 option 集合——这些能力没有对 Agent 开放。
- 不把真实金额、商家或账号写进 README、AGENTS.md 或 skill 示例。
- 示例行（`sample-*`）是引导数据，用户第一次录真实数据前提醒删除，不要拿它们参与统计。
