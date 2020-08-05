const { EditorUI } = require("./editor")
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
        let delete_confirm = this.kernel.setting.get("setting.general.delete_confirm")
        let data = this.password_list_to_ui(this.kernel.storage.all())
        return [
            {
                type: "label",
                props: {
                    text: $l10n("STORAGE"),
                    align: $align.left,
                    font: $font("bold", 34),
                    line: 1,
                },
                layout: make => {
                    make.left.inset(10)
                    make.width.equalTo(120)
                    make.height.equalTo(40)
                    make.top.equalTo(30)
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
                layout: make => {
                    make.height.equalTo(40)
                    make.top.equalTo(30)
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
                    data: data,
                    actions: [{
                        title: delete_confirm ? $l10n("DELETE") : "delete",
                        color: $color("red"),
                        handler: (sender, indexPath) => {
                            let delete_action = () => {
                                let id = data[indexPath.item].id.text
                                if (delete_confirm)
                                    sender.delete(indexPath)
                                // 将被删除的内容写入缓存，用于撤销
                                $cache.set("delete", {
                                    indexPath: indexPath,
                                    value: data[indexPath.item]
                                })
                                // 显示按钮
                                $("undo").hidden = false
                                // 按钮消失
                                this.undo_t = setTimeout(() => {
                                    $("undo").hidden = true
                                    $cache.remove("delete")
                                }, this.undo_time)
                                // 执行真正删除操作
                                this.delete_t = setTimeout(() => {
                                    if (this.kernel.storage.delete(id)) {
                                        $ui.success($l10n("DELETE_SUCCESS"))
                                    } else {
                                        sender.insert({
                                            indexPath: indexPath,
                                            value: data[indexPath.item]
                                        })
                                        $ui.error($l10n("DELETE_ERROR"))
                                    }
                                }, this.undo_time)
                            }
                            if (delete_confirm) {
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
                    make.top.equalTo($("storage_search").top).offset(60)
                    make.bottom.right.left.inset(0)
                },
            },
            {
                type: "view",
                props: {
                    id: "undo",
                    hidden: true,
                    bgcolor: $color("#00FFFF"),
                    cornerRadius: 20,
                },
                views: [
                    {
                        type: "label",
                        props: {
                            font: $font(18),
                            text: $l10n("UNDO"),
                            textColor: $color("white"),
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
                            image: $image("assets/icon/undo-white.png"),
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
                        $cache.remove("delete")
                    }
                },
                layout: (make, view) => {
                    make.centerX.equalTo(view.super)
                    if ($device.isIphoneX) {
                        make.bottom.inset(55 + 60)
                    } else {
                        make.bottom.inset(55 + 20)
                    }
                    make.height.equalTo(40)
                    make.width.equalTo(125)
                },
            },
            {
                type: "button",
                props: {
                    title: "+",
                    font: $font(26),
                    titleColor: $color({
                        light: "#ADADAD",
                        dark: "#C0C0C0"
                    }),
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.right.inset(20)
                    if ($device.isIphoneX) {
                        make.bottom.inset(55 + 60)
                    } else {
                        make.bottom.inset(55 + 20)
                    }
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
                    $("password_list").data = this.password_list_to_ui(this.kernel.storage.all())
                }
                update()
            }
        }
    }
}

module.exports = {
    StorageUI: StorageUI
}