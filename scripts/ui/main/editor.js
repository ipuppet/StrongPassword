const { UIKit } = require("../../easy-jsbox")

class EditorUI {
    constructor(kernel) {
        this.kernel = kernel
    }

    save(password, isUpdate, callback) {
        if (password.password === "") {
            $ui.toast($l10n("NO_PASSWORD"))
            return false
        }
        let result
        if (isUpdate) {
            result = this.kernel.storage.update(password)
        } else {
            result = this.kernel.storage.save(password)
        }
        if (result) {
            $ui.success($l10n("SAVE_SUCCESS"))
            // 弹出窗口
            setTimeout(() => {
                $ui.pop()
                if (typeof callback === "function") callback()
            }, 500)
        } else {
            $ui.error($l10n("SAVE_ERROR"))
        }
    }

    push(password = null, title = $l10n("EDIT"), callback) {
        if (password === null) {
            password = {
                account: "",
                password: "",
                website: [],
                date: ""
            }
        }
        const navButtons = [
            {
                symbol: "checkmark",
                handler: () => {
                    password.account = $("account").text.trim()
                    password.password = $("password").text.trim()
                    password.website = $("website").data
                    password.date = new Date().toLocaleDateString()
                    let isUpdate = false
                    if (undefined !== password.id) {
                        isUpdate = true
                    }
                    this.save(password, isUpdate, callback)
                }
            },
            {
                symbol: "doc.on.doc",
                handler: () => {
                    if (password.password === "") {
                        $ui.toast($l10n("NO_PASSWORD"))
                    } else {
                        $clipboard.text = password.password
                        $ui.toast($l10n("COPY_SUCCESS"))
                    }
                }
            }
        ]
        const views = [
            {
                type: "scroll",
                props: {
                    contentSize: $size(0, (() => {
                        if (password.website) {
                            return 300 + (password.website.length * 20)
                        }
                        return 300
                    })())
                },
                views: [{
                    type: "view",
                    layout: (make, view) => {
                        make.size.equalTo(view.super)
                    },
                    views: [
                        {
                            type: "label",
                            props: {
                                text: $l10n("ACCOUNT"),
                                textColor: UIKit.texColor,
                                align: $align.left,
                                font: $font(16),
                                line: 1
                            },
                            layout: make => {
                                make.left.inset(10)
                                make.width.equalTo(60)
                                make.height.equalTo(40)
                                make.top.equalTo(40)
                            }
                        },
                        { // 账号输入框
                            type: "input",
                            props: {
                                id: "account",
                                align: $align.left,
                                insets: 0,
                                text: password.account,
                                placeholder: $l10n("ACCOUNT"),
                                textColor: UIKit.textColor
                            },
                            layout: (make, view) => {
                                make.right.inset(10)
                                make.left.inset(60)
                                make.height.top.equalTo(view.prev)
                            },
                            events: {
                                returned: sender => {
                                    sender.blur()
                                }
                            }
                        },
                        {
                            type: "label",
                            props: {
                                text: $l10n("PASSWORD"),
                                textColor: UIKit.textColor,
                                align: $align.left,
                                font: $font(16),
                                line: 1
                            },
                            layout: (make, view) => {
                                make.left.inset(10)
                                make.width.equalTo(60)
                                make.height.equalTo(view.prev)
                                make.top.equalTo(view.prev).offset(40 + 30)
                            }
                        },
                        { // 密码输入框
                            type: "input",
                            props: {
                                id: "password",
                                align: $align.left,
                                text: password.password,
                                placeholder: $l10n("PASSWORD"),
                                textColor: UIKit.textColor
                            },
                            layout: (make, view) => {
                                make.right.inset(10)
                                make.left.inset(60)
                                make.height.equalTo(view.prev)
                                make.top.equalTo(view.prev)
                            },
                            events: {
                                returned: sender => {
                                    sender.blur()
                                }
                            }
                        },
                        { // 网站列表
                            type: "list",
                            props: {
                                id: "website",
                                reorder: false,
                                header: {
                                    type: "view",
                                    views: [
                                        {
                                            type: "label",
                                            props: {
                                                text: $l10n("WEBSITE"),
                                                align: $align.left,
                                                textColor: UIKit.textColor,
                                                font: $font(14)
                                            },
                                            layout: (make, view) => {
                                                make.centerY.equalTo(view.super)
                                            }
                                        },
                                        {// 添加网站按钮
                                            type: "button",
                                            props: {
                                                symbol: "plus",
                                                tintColor: UIKit.textColor,
                                                bgcolor: $color("clear")
                                            },
                                            layout: (make, view) => {
                                                make.right.inset(0)
                                                make.size.equalTo(30)
                                                make.centerY.equalTo(view.super)
                                            },
                                            events: {
                                                tapped: sender => {
                                                    $ui.popover({
                                                        sourceView: sender,
                                                        sourceRect: sender.bounds,
                                                        directions: $popoverDirection.down,
                                                        size: $size(320, 150),
                                                        views: [
                                                            {
                                                                type: "input",
                                                                props: {
                                                                    id: "website-inbox",
                                                                    type: $kbType.url,
                                                                    align: $align.left,
                                                                    placeholder: $l10n("WEBSITE")
                                                                },
                                                                layout: make => {
                                                                    make.left.right.inset(10)
                                                                    make.top.inset(20)
                                                                    make.height.equalTo(40)
                                                                },
                                                                events: {
                                                                    returned: sender => {
                                                                        if (sender.text === "") return
                                                                        let website = $("website")
                                                                        website.insert({
                                                                            index: website.data.length,
                                                                            value: sender.text
                                                                        })
                                                                        sender.blur()
                                                                        sender.text = ""
                                                                    }
                                                                }
                                                            },
                                                            {
                                                                type: "button",
                                                                props: {
                                                                    symbol: "plus",
                                                                    tintColor: UIKit.textColor,
                                                                    bgcolor: $color("clear")
                                                                },
                                                                layout: make => {
                                                                    make.right.inset(10)
                                                                    make.size.equalTo(30)
                                                                    make.bottom.inset(40)
                                                                },
                                                                events: {
                                                                    tapped: () => {
                                                                        let websiteInbox = $("website-inbox")
                                                                        if (websiteInbox.text === "") return
                                                                        let website = $("website")
                                                                        website.insert({
                                                                            index: website.data.length,
                                                                            value: websiteInbox.text
                                                                        })
                                                                        websiteInbox.blur()
                                                                        websiteInbox.text = ""
                                                                    }
                                                                }
                                                            }
                                                        ]
                                                    })
                                                }
                                            }
                                        }
                                    ],
                                    layout: (make, view) => {
                                        make.width.equalTo(view.super)
                                        make.height.equalTo(30)
                                    }
                                },
                                data: password.website,
                                actions: [{ title: "delete" }]
                            },
                            layout: (make, view) => {
                                make.left.right.inset(10)
                                make.top.equalTo(view.prev.bottom).offset(40)
                                make.height.equalTo(view.super)
                            }
                        }
                    ]
                }],
                layout: $layout.fill
            }
        ]
        UIKit.push({
            views, title, navButtons
        })
    }
}

module.exports = EditorUI