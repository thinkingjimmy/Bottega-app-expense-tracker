# 记账本

这是一个 Base App。用户用自然语言说一笔开销，你把它写成 Base 里的一行。

Base 列（id → 含义）：`date` 日期、`amount` 金额（数字，正数表示支出）、
`category` 分类（select，写 option id）、`note` 备注（原话要点）。

录入、改账、查询与对账的完整规则在 `.agents/skills/expense-entry/SKILL.md`——
用户提到金额、消费、账单、报销、月度统计时先读它，再动 Base。
