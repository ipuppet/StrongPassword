class FactoryBase {
    constructor(kernel) {
        this.kernel = kernel
        this.selected_page = 0 // 当前显示的页面
    }

    ui_push(views, parent_title = $l10n("BACK"), nav_buttons = []) {
        nav_buttons = [
            {
                type: "button",
                props: {
                    symbol: "chevron.left",
                    tintColor: $color("primaryText", "secondaryText"),
                    bgcolor: $color("clear")
                },
                layout: make => {
                    make.left.inset(10)
                    make.size.equalTo(30)
                }
            },
            {
                type: "label",
                props: {
                    text: parent_title,
                    textColor: $color("primaryText", "secondaryText"),
                    font: $font(18)
                },
                layout: (make, view) => {
                    make.height.equalTo(view.prev)
                    make.left.equalTo(view.prev.right)
                }
            },
            {
                type: "view",
                props: {
                    bgolor: $color("blue")
                },
                layout: (make, view) => {
                    make.height.equalTo(view.prev)
                    make.width.equalTo(view.prev).offset(20)
                    make.left.inset(10)
                },
                events: {
                    tapped: () => {
                        $ui.pop()
                    }
                }
            }
        ].concat(nav_buttons)
        $ui.push({
            props: {
                navBarHidden: true,
                statusBarStyle: 0
            },
            views: [
                {
                    type: "view",
                    props: {
                        clipsToBounds: true,
                    },
                    layout: $layout.fillSafeArea,
                    views: [
                        {
                            type: "view",
                            views: nav_buttons,
                            layout: (make, view) => {
                                make.top.inset(20)
                                make.width.equalTo(view.super)
                                make.height.equalTo(20)
                            }
                        },
                        {
                            type: "view",
                            views: views,
                            layout: (make, view) => {
                                make.top.equalTo(view.prev).offset(30)
                                make.width.equalTo(view.super)
                                make.bottom.equalTo(view.super.safeAreaBottom)
                            }
                        }
                    ]
                }
            ]
        })
    }

    get_menu_data() {
        for (let i = 0; i < this.menu_data.length; i++) {
            if (this.selected_page === i) {
                this.menu_data[i].icon["alpha"] = 1
                this.menu_data[i].title["alpha"] = 1
                this.menu_data[i].icon["tintColor"] = $color("systemLink")
                this.menu_data[i].title["textColor"] = $color("systemLink")
            } else {
                this.menu_data[i].icon["alpha"] = 0.5
                this.menu_data[i].title["alpha"] = 0.5
                this.menu_data[i].icon["tintColor"] = $color("primaryText")
                this.menu_data[i].title["textColor"] = $color("primaryText")
            }
        }
        return this.menu_data
    }

    menu() {
        return {
            type: "matrix",
            props: {
                id: "menu",
                columns: this.menu_data.length,
                itemHeight: 50,
                spacing: 0,
                scrollEnabled: false,
                bgcolor: $color("clear"),
                template: [
                    {
                        type: "image",
                        props: {
                            id: "icon",
                            bgcolor: $color("clear")
                        },
                        layout: (make, view) => {
                            make.centerX.equalTo(view.super)
                            make.size.equalTo(25)
                            make.top.inset(7)
                        },
                    },
                    {
                        type: "label",
                        props: {
                            id: "title",
                            font: $font(10)
                        },
                        layout: (make, view) => {
                            make.centerX.equalTo(view.prev)
                            make.bottom.inset(5)
                        }
                    }
                ],
                data: this.get_menu_data(),
            },
            layout: (make, view) => {
                make.top.inset(0)
                if ($device.info.screen.width > 500) {
                    make.width.equalTo(500)
                } else {
                    make.left.right.inset(0)
                }
                make.centerX.equalTo(view.super)
                make.height.equalTo(50)
            },
            events: {
                didSelect: (sender, indexPath) => {
                    this.selected_page = indexPath.item
                    for (let i = 0; i < this.page_index.length; i++) {
                        if (i === this.selected_page) {
                            $(this.page_index[i]).hidden = false
                        }
                        else {
                            $(this.page_index[i]).hidden = true
                        }
                    }
                    setTimeout(() => { sender.data = this.get_menu_data() }, 100)
                }
            }
        }
    }

    creator(views, index) {
        return {
            type: "view",
            props: {
                id: this.page_index[index],
                hidden: this.selected_page !== index,
                clipsToBounds: true,
            },
            layout: (make, view) => {
                make.size.equalTo(view.super)
            },
            views: views
        }
    }

    render() {
        $ui.render({
            type: "view",
            props: {
                navBarHidden: true,
                statusBarStyle: 0,
            },
            layout: $layout.fillSafeArea,
            views: [
                {
                    type: "view",
                    props: {
                        clipsToBounds: true,
                    },
                    layout: make => {
                        make.top.inset(20)
                        make.left.right.bottom.inset(0)
                    },
                    views: this.views
                },
                {
                    type: "view",
                    layout: (make, view) => {
                        make.top.equalTo(view.super.safeAreaBottom).offset(-50)
                        make.bottom.left.right.inset(0)
                    },
                    views: [
                        {
                            type: "blur",
                            props: {
                                style: $blurStyle.thinMaterial,
                            },
                            layout: $layout.fill,
                        },
                        this.menu()
                    ],
                },
                {
                    type: "canvas",
                    layout: (make, view) => {
                        make.top.equalTo(view.prev.top)
                        make.height.equalTo(1 / $device.info.screen.scale)
                        make.left.right.inset(0)
                    },
                    events: {
                        draw: (view, ctx) => {
                            let width = view.frame.width
                            let scale = $device.info.screen.scale
                            ctx.strokeColor = $color("gray")
                            ctx.setLineWidth(1 / scale)
                            ctx.moveToPoint(0, 0)
                            ctx.addLineToPoint(width, 0)
                            ctx.strokePath()
                        }
                    }
                }
            ]
        })
    }
}

class Factory extends FactoryBase {
    constructor(kernel) {
        super(kernel)
        this.page_index = [// 通过索引获取页面id
            "home",// 0 => 首页
            "storage",// 1 => 储藏室
            "setting",// 2 => 设置
        ]
        this.views = [
            this.home(),
            this.storage(),
            this.setting(),
        ]
        this.menu_data = [
            {
                icon: { symbol: "lock.circle" },
                title: { text: $l10n("PASSWORD") }
            },
            {
                icon: { symbol: "archivebox" },
                title: { text: $l10n("STORAGE") }
            },
            {
                icon: { symbol: "gear" },
                title: { text: $l10n("SETTING") }
            }
        ]
    }

    home() {
        const HomeUI = require("./home")
        let ui_interface = new HomeUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 0)
    }

    storage() {
        const StorageUI = require("./storage")
        let ui_interface = new StorageUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 1)
    }

    setting() {
        const SettingUI = require("./setting")
        let ui_interface = new SettingUI(this.kernel, this)
        return this.creator(ui_interface.get_views(), 2)
    }
}

module.exports = Factory