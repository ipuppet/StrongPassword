# Strong Password

> 一个强密码生成器

[通过Erots安装](https://liuguogy.github.io/JSBox-addins/?q=show&objectId=5f21af7237d3b40008e86146)

一键生成强密码，提升账号安全性！

- 自动复制，节约宝贵时间。
- 保存到本地，防止密码丢失。
- 可自由设置密码长度。
- 自动切换深色模式。
- 语言：简体中文, English

**请保存好您的密码文件，不要泄漏给他人。**

### 存储说明

密码存储文件：`storage/StrongPassword.db`

可主动备份该文件，需要还原时直接覆盖原文件即可。

## 备份

- ### 自动备份

    自动备份会在您保存密码(通过随机生成或手动添加)时触发备份

    **注意：这个备份会覆盖上一个备份，但不会影响 `备份到iCloud` 选项备份的文件**

    文件将备份到您的iCloud下的JSBox中

    路径为 `JSBox/StrongPassword/auto.db`

- ### 备份到iCloud

    备份到iCloud选项可手动备份到iCloud

    **注意：这个备份会覆盖上一个备份，但不会影响自动备份**

- ### 从iCloud恢复

    可以从iCloud选择备份的.db文件进行恢复，效果与手动覆盖原文件一致。

    注意：JSBox在选择iCloud文件时可能出现卡顿，这是正常现象，等待选择文件的弹窗弹出即可。若出现无法访问的情况可点击再试一次进行重试。

# 小组件和键盘模式

**注意，是单独小组件，不是从启动器启动，同时不建议从启动器启动，启动器无法翻页**

- 小组件和键盘模式中，无法调用输入法，故保存操作将会自动将密码的账号和网站设置为 'AUTO-SAVE'，你可以到主程序的储藏室进行修改(直接点击即可弹出编辑页面)。

- 小组件和键盘的储藏室，直接点击为复制密码，滑动可显示额外操作。(不可从这两个模式删除密码，防止误操作)