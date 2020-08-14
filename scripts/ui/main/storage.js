const EditorUI = require("./editor")

class StorageUI {
    constructor(kernel) {
        this.kernel = kernel
        this.editor = new EditorUI(this.kernel)
        this.undo_time = 3000 // 撤销时间 毫秒
        this.undo_t = null // 撤销按钮
        this.delete_t = null // 真正的删除操作
    }

    search(kw) {
        if (kw === "") {
            $("password_list").data = this.password_list_to_ui(this.kernel.storage.all())
            return
        }
        let data = this.kernel.storage.search(kw)
        if (data.length > 0) {
            $("password_list").data = this.password_list_to_ui(data)
        } else {
            $("password_list").data = [{
                id: {
                    text: ""
                },
                website_data: {
                    text: ""
                },
                website: {
                    text: ""
                },
                password: {
                    text: ""
                },
                account: {
                    text: ""
                },
                date: {
                    text: ""
                },
                no_result: {
                    text: $l10n("NO_RESULT")
                }
            }]
        }
    }

    password_list_to_ui(data) {
        function get_label(password) {
            return {
                id: {
                    text: password.id
                },
                website_data: {
                    text: JSON.stringify(password.website)
                },
                website: {
                    text: password.website.length > 0 ? password.website[0] : "NULL"
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
                    text: ""
                }
            }
        }
        if (this.all_data !== false) {
            let result = []
            for (let password of data) {
                result.push(get_label(password))
            }
            return result
        }
    }

    get_views() {
        this.data = this.password_list_to_ui(this.kernel.storage.all())
        return [
            {
                type: "label",
                props: {
                    text: $l10n("STORAGE"),
                    textColor: $color("primaryText", "secondaryText"),
                    align: $align.left,
                    font: $font("bold", 34),
                    line: 1,
                },
                layout: (make, view) => {
                    make.left.inset(10)
                    make.width.equalTo(120)
                    make.height.equalTo(40)
                    make.top.equalTo(view.super.safeAreaTop).offset(50)
                }
            },
            {
                type: "input",
                props: {
                    id: "storage_search",
                    placeholder: $l10n("STORAGE_SEARCH"),
                    type: $kbType.search,
                    autoFontSize: true,
                },
                layout: (make, view) => {
                    make.height.equalTo(40)
                    make.top.equalTo(view.prev)
                    make.right.inset(10)
                    make.left.inset(130)
                },
                events: {
                    changed: sender => {
                        this.search(sender.text.trim())
                    },
                    returned: sender => {
                        this.search(sender.text.trim()),
                            sender.blur()
                    }
                }
            },
            {
                type: "list",
                props: {
                    id: "password_list",
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
                                layout: (make, view) => {
                                    make.bottom.inset(5)
                                    make.left.right.inset(0)
                                }
                            }
                        ]
                    },
                    data: this.data,
                    actions: [{
                        title: $l10n("DELETE"),
                        color: $color("red"),
                        handler: (sender, indexPath) => {
                            let delete_action = () => {
                                sender.delete(indexPath)
                                let id = this.data[indexPath.item].id.text
                                let password = this.data[indexPath.item]
                                this.data = sender.data
                                // 将被删除的内容写入缓存，用于撤销
                                $cache.set("delete", {
                                    indexPath: indexPath,
                                    value: password
                                })
                                $cache.set("list", sender.data)
                                // 显示按钮
                                $("undo").hidden = false
                                // 按钮消失
                                clearTimeout(this.undo_t)// 防止按钮显示错乱
                                this.undo_t = setTimeout(() => {
                                    $("undo").hidden = true
                                    $cache.remove("delete")
                                    $cache.remove("list")
                                }, this.undo_time)
                                // 执行真正删除操作
                                this.delete_t = setTimeout(() => {
                                    if (this.kernel.storage.delete(id)) {
                                        if ($("password_list").data[indexPath.item].id.text === id) {
                                            $("password_list").delete(indexPath)
                                        }
                                    } else {
                                        $("password_list").insert({
                                            indexPath: indexPath,
                                            value: password
                                        })
                                        this.data.splice(indexPath.item, password)
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
                                            handler: () => {
                                                delete_action()
                                            }
                                        },
                                        { title: $l10n("CANCEL") }
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
                                    hidden: true,
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "website_data",
                                    hidden: true,
                                }
                            },
                            {
                                type: "label",
                                props: {
                                    id: "website",
                                    font: $font(18),
                                    align: $align.left
                                },
                                layout: (make, view) => {
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
                                layout: (make, view) => {
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
                                layout: (make, view) => {
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
                                layout: (make, view) => {
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
                            this.editor.push(password)
                        }
                    }
                },
                layout: make => {
                    make.top.equalTo($("storage_search").top).offset(70)
                    make.bottom.right.left.inset(0)
                },
            },
            {
                type: "view",
                props: {
                    id: "undo",
                    hidden: this.undo_t === null,
                    bgcolor: $color("primarySurface"),
                    borderWidth: 1,
                    borderColor: $color("systemGray6"),
                    cornerRadius: 20,
                },
                views: [
                    {
                        type: "label",
                        props: {
                            font: $font(18),
                            text: $l10n("UNDO"),
                            textColor: $color("primaryText", "secondaryText"),
                            align: $align.center
                        },
                        layout: (make, view) => {
                            make.centerY.equalTo(view.super)
                            make.left.inset(35)
                        }
                    },
                    {
                        type: "button",
                        props: {
                            symbol: "arrow.counterclockwise",
                            tintColor: $color("primaryText", "secondaryText"),
                            bgcolor: $color("clear")
                        },
                        layout: (make, view) => {
                            make.centerY.equalTo(view.super)
                            make.right.inset(30)
                            make.height.width.equalTo(20)
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
                        $("password_list").insert($cache.get("delete"))
                        this.data = $("password_list").data
                        $cache.remove("delete")
                        $cache.remove("list")
                    }
                },
                layout: (make, view) => {
                    make.centerX.equalTo(view.super)
                    make.height.equalTo(40)
                    make.width.equalTo(125)
                    make.bottom.equalTo(view.super.safeAreaBottom).offset(-75)
                },
            },
            {
                type: "button",
                props: {
                    symbol: "plus",
                    tintColor: $color("primaryText", "secondaryText"),
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

    get_events() {
        return {
            appeared: async () => {
                // 直接写会不明原因无法更新
                // 放到箭头函数里就没问题
                let update = () => {
                    let cache = $cache.get("list")
                    this.data = cache ? cache : this.password_list_to_ui(this.kernel.storage.all())
                    $("password_list").data = this.data
                }
                update()
            }
        }
    }
}

module.exports = StorageUI