const EditorUI = require("./editor")

class StorageUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.editor = new EditorUI(this.kernel, this.factory)
        $cache.set("storageList", StorageUI.listTemplate(this.kernel.storage.all()))
        this.undoTime = 3000 // 撤销时间 毫秒
        this.undoT = null // 撤销按钮
        this.deleteT = null // 真正的删除操作
    }

    copyPassword(password) {
        if (password !== null) {
            $clipboard.text = password
            $ui.toast($l10n("COPY_SUCCESS"))
        }
    }

    static setData(list) {
        list = StorageUI.listTemplate(list)
        $("storage-list").data = list
        $cache.set("storageList", list)
    }

    /**
     * 更新列表的数据
     * @param {Object} password 密码
     * @param {*} index 位置，如果为null则直接插入数据
     */
    static update(password, index = null) {
        let list = $cache.get("storageList")
        index = index === null ? list.length : index
        // 更新列表数据
        list[index] = StorageUI.template(password)
        $("storage-list").data = list
        // 同步到缓存
        $cache.set("storageList", list)
    }

    static template(password, noResult = "") {
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

    static listTemplate(data) {
        let result = []
        for (let password of data) {
            result.push(StorageUI.template(password))
        }
        return result
    }

    search(kw) {
        if (kw === "") {
            $("storage-list").data = StorageUI.listTemplate(this.kernel.storage.all())
            return
        }
        let data = this.kernel.storage.search(kw)
        if (data.length > 0) {
            $("storage-list").data = StorageUI.listTemplate(data)
        } else {
            let password = {
                id: "",
                websiteData: "",
                website: [],
                password: "",
                account: "",
                date: ""
            }
            $("storage-list").data = [StorageUI.template(password, $l10n("NO_RESULT"))]
        }
    }

    getViews() {
        return [
            this.factory.headerTitle("storage-view", $l10n("STORAGE")),
            { // 搜索
                type: "input",
                props: {
                    id: "storage-search",
                    placeholder: $l10n("STORAGE_SEARCH"),
                    type: $kbType.search,
                    autoFontSize: true
                },
                layout: make => {
                    make.height.equalTo(35)
                    make.centerY.equalTo($("storage-view").centerY)
                    make.right.inset(20)
                    make.left.inset(150)
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
            },
            { // 列表
                type: "list",
                props: {
                    id: "storage-list",
                    style: 1,
                    reorder: false,
                    indicatorInsets: $insets(0, 0, 50, 0),
                    rowHeight: 60,
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
                    data: $cache.get("storageList"),
                    actions: [
                        {
                            title: "delete",
                            color: $color("red"),
                            handler: (sender, indexPath) => {
                                // 缓存storage-list延后更新，用来获取列表中被删除的条目的信息
                                let password = $cache.get("storageList")[indexPath.item]
                                let deleteAction = () => {
                                    let id = $cache.get("storageList")[indexPath.item].id.text
                                    // 更新缓存内容
                                    $cache.set("storageList", sender.data)
                                    // 将被删除的内容写入缓存，用于撤销
                                    $cache.set("storageDeleted", {
                                        indexPath: indexPath,
                                        value: password
                                    })
                                    // 显示按钮
                                    $("undo").hidden = false
                                    clearTimeout(this.undoT)// 防止按钮显示错乱
                                    // 按钮消失倒计时
                                    this.undoT = setTimeout(() => {
                                        $("undo").hidden = true
                                        $cache.remove("storageDeleted")
                                    }, this.undoTime)
                                    // 真正删除操作
                                    this.deleteT = setTimeout(() => {
                                        if (!this.kernel.storage.delete(id)) {
                                            sender.insert({
                                                indexPath: indexPath,
                                                value: password
                                            })
                                            // 删除失败，恢复缓存内容
                                            $cache.set("storageList", sender.data)
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
                                                title: $l10n("OK"),
                                                handler: deleteAction
                                            },
                                            {
                                                title: $l10n("CANCEL"),
                                                handler: () => {
                                                    sender.insert({
                                                        indexPath: indexPath,
                                                        value: password
                                                    })
                                                }
                                            }
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
                                let data = sender.object(indexPath)
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
                            let password = {
                                id: sender.object(indexPath).id.text,
                                account: sender.object(indexPath).account.text,
                                password: sender.object(indexPath).password.text,
                                website: JSON.parse(sender.object(indexPath).websiteData.text),
                                date: sender.object(indexPath).date.text
                            }
                            this.editor.push(password, indexPath.item)
                        }
                    }
                },
                layout: (make, view) => {
                    make.top.equalTo(view.prev.top).offset(50)
                    make.bottom.right.left.inset(0)
                }
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
                            textColor: this.factory.textColor,
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
                            tintColor: this.factory.textColor,
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
                        let storageList = $("storage-list")
                        storageList.insert($cache.get("storageDeleted"))
                        $cache.set("storageList", storageList.data)
                        $cache.remove("storageDeleted")
                    }
                },
                layout: (make, view) => {
                    make.centerX.equalTo(view.super)
                    make.height.equalTo(40)
                    make.width.equalTo(125)
                    make.bottom.equalTo(view.super.safeAreaBottom).offset(-75)
                }
            },
            { // 添加
                type: "button",
                props: {
                    symbol: "plus",
                    tintColor: this.factory.textColor,
                    bgcolor: $color("clear")
                },
                layout: (make, view) => {
                    make.right.inset(20)
                    make.size.equalTo(30)
                    make.bottom.equalTo(view.super.safeAreaBottom).offset(-80)
                },
                events: {
                    tapped: () => {
                        this.editor.push()
                    }
                }
            }
        ]
    }
}

module.exports = StorageUI