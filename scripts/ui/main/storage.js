const EditorUI = require("./editor")

class StorageUI {
    constructor(kernel, factory) {
        this.kernel = kernel
        this.factory = factory
        this.editor = new EditorUI(this.kernel, this.factory)
        $cache.set("storage_list", StorageUI.template_list(this.kernel.storage.all()))
        this.undo_time = 3000 // 撤销时间 毫秒
        this.undo_t = null // 撤销按钮
        this.delete_t = null // 真正的删除操作
    }

    static set_data(list) {
        list = StorageUI.template_list(list)
        $("storage_list").data = list
        $cache.set("storage_list", list)
    }

    /**
     * 更新列表的数据
     * @param {Object} password 密码
     * @param {*} index 位置，如果为null则直接插入数据
     */
    static update(password, index = null) {
        let list = $cache.get("storage_list")
        index = index === null ? list.length : index
        // 更新列表数据
        list[index] = StorageUI.template(password)
        $("storage_list").data = list
        // 同步到缓存
        $cache.set("storage_list", list)
    }

    static template(password, no_result = "") {
        return {
            id: {
                text: password.id
            },
            website_data: {
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
            no_result: {
                text: no_result
            }
        }
    }

    static template_list(data) {
        let result = []
        for (let password of data) {
            result.push(StorageUI.template(password))
        }
        return result
    }

    search(kw) {
        if (kw === "") {
            $("storage_list").data = StorageUI.template_list(this.kernel.storage.all())
            return
        }
        let data = this.kernel.storage.search(kw)
        if (data.length > 0) {
            $("storage_list").data = StorageUI.template_list(data)
        } else {
            let password = {
                id: "",
                website_data: "",
                website: [],
                password: "",
                account: "",
                date: ""
            }
            $("storage_list").data = [StorageUI.template(password, $l10n("NO_RESULT"))]
        }
    }

    get_views() {
        return [
            this.factory.standard_header("storage_view", $l10n("STORAGE")),
            {
                type: "input",
                props: {
                    id: "storage_search",
                    placeholder: $l10n("STORAGE_SEARCH"),
                    type: $kbType.search,
                    autoFontSize: true
                },
                layout: make => {
                    make.height.equalTo(40)
                    make.top.equalTo($("storage_view").top)
                    make.right.inset(10)
                    make.left.inset(130)
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
            {
                type: "list",
                props: {
                    id: "storage_list",
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
                    data: $cache.get("storage_list"),
                    actions: [{
                        title: "delete",
                        color: $color("red"),
                        handler: (sender, indexPath) => {
                            // 缓存storage_list延后更新，用来获取列表中被删除的条目的信息
                            let password = $cache.get("storage_list")[indexPath.item]
                            let delete_action = () => {
                                let id = $cache.get("storage_list")[indexPath.item].id.text
                                // 更新缓存内容
                                $cache.set("storage_list", sender.data)
                                // 将被删除的内容写入缓存，用于撤销
                                $cache.set("storage_deleted", {
                                    indexPath: indexPath,
                                    value: password
                                })
                                // 显示按钮
                                $("undo").hidden = false
                                clearTimeout(this.undo_t)// 防止按钮显示错乱
                                // 按钮消失倒计时
                                this.undo_t = setTimeout(() => {
                                    $("undo").hidden = true
                                    $cache.remove("storage_deleted")
                                }, this.undo_time)
                                // 真正删除操作
                                this.delete_t = setTimeout(() => {
                                    if (!this.kernel.storage.delete(id)) {
                                        sender.insert({
                                            indexPath: indexPath,
                                            value: password
                                        })
                                        // 删除失败，恢复缓存内容
                                        $cache.set("storage_list", sender.data)
                                        $ui.error($l10n("DELETE_ERROR"))
                                    }
                                }, this.undo_time)
                            }
                            if (this.kernel.setting.get("setting.general.delete_confirm")) {
                                $ui.alert({
                                    title: $l10n("ALERT_INFO"),
                                    message: $l10n("CONFIRM_DELETE_MSG"),
                                    actions: [
                                        {
                                            title: $l10n("OK"),
                                            handler: delete_action
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
                                delete_action()
                            }
                        }
                    }],
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
                                    id: "website_data",
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
                                    id: "no_result",
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
                        if (data.no_result.text.trim() !== $l10n("NO_RESULT")) {
                            let password = {
                                id: sender.object(indexPath).id.text,
                                account: sender.object(indexPath).account.text,
                                password: sender.object(indexPath).password.text,
                                website: JSON.parse(sender.object(indexPath).website_data.text),
                                date: sender.object(indexPath).date.text
                            }
                            this.editor.push(password, indexPath.item)
                        }
                    }
                },
                layout: make => {
                    make.top.equalTo($("storage_search").top).offset(70)
                    make.bottom.right.left.inset(0)
                }
            },
            {
                type: "view",
                props: {
                    id: "undo",
                    hidden: this.undo_t === null,
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
                            textColor: this.factory.text_color,
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
                            tintColor: this.factory.text_color,
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
                        clearTimeout(this.undo_t)
                        clearTimeout(this.delete_t)
                        // 隐藏按钮
                        $("undo").hidden = true
                        // 将被删除的列表项重新插入
                        let storage_list = $("storage_list")
                        storage_list.insert($cache.get("storage_deleted"))
                        $cache.set("storage_list", storage_list.data)
                        $cache.remove("storage_deleted")
                    }
                },
                layout: (make, view) => {
                    make.centerX.equalTo(view.super)
                    make.height.equalTo(40)
                    make.width.equalTo(125)
                    make.bottom.equalTo(view.super.safeAreaBottom).offset(-75)
                }
            },
            {
                type: "button",
                props: {
                    symbol: "plus",
                    tintColor: this.factory.text_color,
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