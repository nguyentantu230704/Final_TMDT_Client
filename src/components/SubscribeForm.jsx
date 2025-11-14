import React from "react";

export default function SubscribeForm () {
    return (
        <div className="flex justify-center items-center my-10">
            <form
                action="https://gmail.us14.list-manage.com/subscribe/post?u=c27e8b8956a4431f37f378827&amp;id=2f4d06a98e&amp;f_id=008b9ce0f0"
                method="post"
                id="mc-embedded-subscribe-form" 
                // name="mc-embedded-subscribe-form
                target="hidden_iframe"
                onSubmit={() => alert("Cảm ơn bạn đã đăng ký!")}
                className="space-y-2"
            >
                <h3 className="text-lg font-semibold">Đăng ký nhận bảng tin</h3>
                <input
                    type="email"
                    name="EMAIL"
                    placeholder="Nhập email của bạn"
                    required
                    className="border p-2 rounded w-64"
                />
                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                    Đăng ký
                </button>
                <iframe name="hidden_iframe" style={{ display: "none" }}></iframe>
            </form>
        </div>
    );
};  