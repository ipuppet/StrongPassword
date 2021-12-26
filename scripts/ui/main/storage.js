const { UIKit } = require("../../easy-jsbox")
const EditorUI = require("./editor")

class StorageUI {
    constructor(kernel) {
        this.kernel = kernel
        this.editor = new EditorUI(this.kernel)
        this.storageKey = {
            deleted: "storageDeleted"
        }
        this.undoTime = 3000 // 撤销时间 毫秒
        this.undoT = null // 撤销按钮
        this.deleteT = null // 真正的删除操作
        this.listId = "storage-list"
    }

    copyPassword(password) {
        if (password !== null) {
            $clipboard.text = password
            $ui.toast($l10n("COPY_SUCCESS"))
        }
    }

    template(password, noResult = "") {
        return {
            id: {
                text: password.id
            },
            websiteData: {
                text: JSON.stringify(password.website)
            },
            website: {
                text: password.website.length > 0 ? password.website[0] : ""
            },
            password: {
                text: password.password
            },
            account: {
                text: password.account
            },
            date: {
                text: password.date
            },
            noResult: {
                text: noResult
            }
        }
    }

    listTemplate(data) {
        const result = []
        for (let password of data) {
            result.push(this.template(password))
        }
        return result
    }

    search(kw) {
        if (kw === "") {
            $(this.listId).data = this.listTemplate(this.kernel.storage.all())
            return
        }
        const data = this.kernel.storage.search(kw)
        if (data.length > 0) {
            $(this.listId).data = this.listTemplate(data)
        } else {
            const password = {
                id: "",
                websiteData: "",
                website: [],
                password: "",
                account: "",
                date: ""
            }
            $(this.listId).data = [this.template(password, $l10n("NO_RESULT"))]
        }
    }

    update() {
        $(this.listId).data = this.listTemplate(this.kernel.storage.all())
    }

    getViews() {
        return [
            { // 列表
                type: "list",
                props: {
                    id: this.listId,
                    style: 1,
                    reorder: false,
                    indicatorInsets: $insets(0, 0, 50, 0),
                    rowHeight: 60,
                    header: {
                        type: "view",
                        props: { height: 130 },
                        views: [
                            {
                                type: "label",
                                props: {
                                    text: $l10n("STORAGE"),
                                    textColor: UIKit.textColor,
                                    align: $align.left,
                                    font: $font("bold", 35),
                                    line: 1
                                },
                                layout: (make, view) => {
                                    make.left.equalTo(view.super.safeArea).offset(20)
                                    make.top.equalTo(view.super.safeAreaTop).offset(20)
                                }
                            },
                            { // 搜索
                                type: "input",
                                props: {
                                    id: "storage-search",
                                    placeholder: $l10n("STORAGE_SEARCH"),
                                    type: $kbType.search,
                                    autoFontSize: true
                                },
                                layout: (make, view) => {
                                    make.height.equalTo(35)
                                    make.right.left.inset(20)
                                    make.top.equalTo(view.prev.bottom).offset(10)
                                },
                                events: {
                                    changed: sender => {
                                        this.search(sender.text.trim())
                                    },
                                    returned: sender => {
                                        this.search(sender.text.trim())
                                        sender.blur()
                                    }
                                }
                            }
                        ]
                    },
                    footer: {
                        type: "view",
                        views: [
                            {
                                type: "label",
                                props: {
                                    font: $font(14),
                                    text: $l10n("LIST_END"),
                                    textColor: $color({
                                        light: "#C0C0C0",
                                        dark: "#545454"
                                    }),
                                    align: $align.center
                                },
                                layout: make => {
                                    make.bottom.inset(5)
                                    make.left.right.inset(0)
                                }
                            }
                        ]
                    },
                    data: this.listTemplate(this.kernel.storage.all()),
                    actions: [
                        {
                            title: $l10n("DELETE") + " ",
                            color: $color("red"),
                            handler: (sender, indexPath) => {
                                // 获取数据
                                const password = sender.object(indexPath)
                                const deleteAction = () => {
                                    // 从列表中删除
                                    sender.delete(indexPath)
                                    const id = password.id.text
                                    // 将被删除的内容写入缓存，用于撤销
                                    $cache.set(this.storageKey.deleted, {
                                        indexPath: indexPath,
                                        value: password
                                    })
                                    // 显示按钮
                                    $("undo").hidden = false
                                    clearTimeout(this.undoT) // 防止按钮显示错乱
                                    // 按钮消失倒计时
                                    this.undoT = setTimeout(() => {
                                        $("undo").hidden = true
                                        $cache.remove(this.storageKey.deleted)
                                    }, this.undoTime)
                                    // 真正删除操作
                                    this.deleteT = setTimeout(() => {
                                        if (!this.kernel.storage.delete(id)) {
                                            sender.insert({
                                                indexPath: indexPath,
                                                value: password
                                            })
                                            $ui.error($l10n("DELETE_ERROR"))
                                        }
                                    }, this.undoTime)
                                }
                                if (this.kernel.setting.get("general.deleteConfirm")) {
                                    $ui.alert({
                                        title: $l10n("ALERT_INFO"),
                                        message: $l10n("CONFIRM_DELETE_MSG"),
                                        actions: [
                                            {
                                                title: $l10n("DELETE"),
                                                style: $alertActionType.destructive,
                                                handler: deleteAction
                                            },
                                            { title: $l10n("CANCEL") }
                                        ]
                                    })
                                } else {
                                    deleteAction()
                                }
                            }
                        },
                        {
                            title: $l10n("COPY"),
                            handler: (sender, indexPath) => {
                                const data = sender.object(indexPath)
                                this.copyPassword(data.password.text)
                            }
                        }
                    ],
                    template: {
                        props: {},
                        views: [
                            {
                                type: "label",
                                props: {
                                    id: "id",
                                    hidden: true
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "website-data",
                                    hidden: true
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "website",
                                    font: $font(18),
                                    align: $align.left
                                },
                                layout: make => {
                                    make.top.inset(10)
                                    make.left.inset(10)
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "account",
                                    font: $font(14),
                                    textColor: $color({
                                        light: "#C0C0C0",
                                        dark: "#545454"
                                    }),
                                    align: $align.left
                                },
                                layout: make => {
                                    make.bottom.inset(5)
                                    make.left.inset(10)
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "date",
                                    font: $font(14),
                                    textColor: $color({
                                        light: "#C0C0C0",
                                        dark: "#545454"
                                    }),
                                    align: $align.right
                                },
                                layout: make => {
                                    make.bottom.inset(5)
                                    make.right.inset(10)
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "no-result",
                                    align: $align.center
                                },
                                layout: make => {
                                    make.left.right.inset(10)
                                    make.top.inset(15)
                                }
                            }
                        ]
                    }
                },
                events: {
                    didSelect: (sender, indexPath, data) => {
                        if (data.noResult.text.trim() !== $l10n("NO_RESULT")) {
                            const password = {
                                id: sender.object(indexPath).id.text,
                                account: sender.object(indexPath).account.text,
                                password: sender.object(indexPath).password.text,
                                website: JSON.parse(sender.object(indexPath).websiteData.text),
                                date: sender.object(indexPath).date.text
                            }
                            this.editor.push(password, $l10n("EDIT"), () => {
                                setTimeout(() => this.update(), 500)
                            })
                        }
                    }
                },
                layout: $layout.fill
            },
            { // 撤销
                type: "view",
                props: {
                    id: "undo",
                    hidden: this.undoT === null,
                    bgcolor: $color("primarySurface"),
                    borderWidth: 1,
                    borderColor: $color("systemGray6"),
                    cornerRadius: 20
                },
                views: [
                    {
                        type: "label",
                        props: {
                            font: $font(18),
                            text: $l10n("UNDO"),
                            textColor: UIKit.textColor,
                            align: $align.center
                        },
                        layout: (make, view) => {
                            make.centerY.equalTo(view.super)
                            make.left.inset(35)
                        }
                    },
                    {
                        type: "image",
                        props: {
                            symbol: "arrow.counterclockwise",
                            tintColor: UIKit.textColor,
                            bgcolor: $color("clear")
                        },
                        layout: (make, view) => {
                            make.centerY.equalTo(view.super)
                            make.right.inset(30)
                            make.size.equalTo(18)
                        }
                    }
                ],
                events: {
                    tapped: () => {
                        // 销毁操作
                        clearTimeout(this.undoT)
                        clearTimeout(this.deleteT)
                        // 隐藏按钮
                        $("undo").hidden = true
                        // 将被删除的列表项重新插入
                        const storageList = $(this.listId)
                        storageList.insert($cache.get(this.storageKey.deleted))
                        $cache.remove(this.storageKey.deleted)
                    }
                },
                layout: (make, view) => {
                    make.centerX.equalTo(view.super)
                    make.height.equalTo(40)
                    make.width.equalTo(125)
                    make.bottom.equalTo(view.super.safeAreaBottom).offset(-75)
                }
            }
        ]
    }
}

module.exports = StorageUI