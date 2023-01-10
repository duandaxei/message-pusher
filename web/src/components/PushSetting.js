import React, { useEffect, useState } from 'react';
import {
  Button,
  Divider,
  Form,
  Grid,
  Header,
  Message,
} from 'semantic-ui-react';
import { API, removeTrailingSlash, showError, showSuccess } from '../helpers';
import axios from 'axios';

const PushSetting = () => {
  let [inputs, setInputs] = useState({
    id: '',
    username: '',
    channel: '',
    token: '',
    wechat_test_account_id: '',
    wechat_test_account_secret: '',
    wechat_test_account_template_id: '',
    wechat_test_account_open_id: '',
    wechat_corp_account_id: '',
    wechat_corp_account_agent_secret: '',
    wechat_corp_account_agent_id: '',
    wechat_corp_account_user_id: '',
    wechat_corp_account_client_type: '',
    corp_webhook_url: '',
    lark_webhook_url: '',
    lark_webhook_secret: '',
    ding_webhook_url: '',
    ding_webhook_secret: '',
    bark_server: '',
    bark_secret: '',
    client_secret: '',
    telegram_bot_token: '',
    telegram_chat_id: '',
    discord_webhook_url: '',
  });
  let [loading, setLoading] = useState(false);

  const handleInputChange = (e, { name, value }) => {
    setInputs((inputs) => ({ ...inputs, [name]: value }));
  };

  const loadUser = async () => {
    let res = await API.get(`/api/user/self`);
    const { success, message, data } = res.data;
    if (success) {
      if (data.channel === '') {
        data.channel = 'email';
      }
      if (data.wechat_corp_account_client_type === '') {
        data.wechat_corp_account_client_type = 'plugin';
      }
      if (data.token === ' ') {
        data.token = '';
      }
      if (data.bark_server === '') {
        data.bark_server = 'https://api.day.app';
      }
      setInputs(data);
    } else {
      showError(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUser().then();
  }, []);

  const submit = async (which) => {
    let data = {};
    switch (which) {
      case 'general':
        data.channel = inputs.channel;
        data.token = inputs.token;
        if (data.token === '') {
          data.token = ' ';
        }
        break;
      case 'test':
        data.wechat_test_account_id = inputs.wechat_test_account_id;
        data.wechat_test_account_secret = inputs.wechat_test_account_secret;
        data.wechat_test_account_template_id =
          inputs.wechat_test_account_template_id;
        data.wechat_test_account_open_id = inputs.wechat_test_account_open_id;
        break;
      case 'corp_app':
        data.wechat_corp_account_id = inputs.wechat_corp_account_id;
        data.wechat_corp_account_agent_secret =
          inputs.wechat_corp_account_agent_secret;
        data.wechat_corp_account_agent_id = inputs.wechat_corp_account_agent_id;
        data.wechat_corp_account_user_id = inputs.wechat_corp_account_user_id;
        data.wechat_corp_account_client_type =
          inputs.wechat_corp_account_client_type;
        break;
      case 'corp':
        data.corp_webhook_url = inputs.corp_webhook_url;
        break;
      case 'lark':
        data.lark_webhook_url = inputs.lark_webhook_url;
        data.lark_webhook_secret = inputs.lark_webhook_secret;
        break;
      case 'ding':
        data.ding_webhook_url = inputs.ding_webhook_url;
        data.ding_webhook_secret = inputs.ding_webhook_secret;
        break;
      case 'bark':
        data.bark_server = removeTrailingSlash(inputs.bark_server);
        data.bark_secret = inputs.bark_secret;
        break;
      case 'client':
        data.client_secret = inputs.client_secret;
        break;
      case 'telegram':
        data.telegram_bot_token = inputs.telegram_bot_token;
        data.telegram_chat_id = inputs.telegram_chat_id;
        break;
      case 'discord':
        data.discord_webhook_url = inputs.discord_webhook_url;
        break;
      default:
        showError(`无效的参数：${which}`);
        return;
    }
    let res = await API.put(`/api/user/self`, data);
    const { success, message } = res.data;
    if (success) {
      showSuccess('设置已更新！');
    } else {
      showError(message);
    }
  };

  const test = async (type) => {
    let res = await API.get(
      `/push/${inputs.username}?token=${inputs.token}&channel=${type}&title=消息推送服务&description=配置成功！`
    );
    const { success, message } = res.data;
    if (success) {
      showSuccess('测试消息已发送');
    } else {
      showError(message);
    }
  };

  const getTelegramChatId = async () => {
    if (inputs.telegram_bot_token === '') {
      showError('请先输入 Telegram 机器人令牌！');
      return;
    }
    let res = await axios.get(
      `https://api.telegram.org/bot${inputs.telegram_bot_token}/getUpdates`
    );
    const { ok } = res.data;
    if (ok) {
      let result = res.data.result;
      if (result.length === 0) {
        showError(`请先向你的机器人发送一条任意消息！`);
      } else {
        let id = result[0]?.message?.chat?.id;
        id = id.toString();
        setInputs((inputs) => ({ ...inputs, telegram_chat_id: id }));
        showSuccess('会话 ID 获取成功，请点击保存按钮保存！');
      }
    } else {
      showError(`发生错误：${res.description}`);
    }
  };

  return (
    <Grid columns={1}>
      <Grid.Column>
        <Form loading={loading}>
          <Header as='h3'>通用设置</Header>
          <Message>
            注意：敏感配置信息不会发送到前端显示。另外浏览器可能会错误填充账户和密钥信息，请留意。
          </Message>
          <Form.Group widths={3}>
            <Form.Select
              label='默认推送方式'
              name='channel'
              options={[
                { key: 'email', text: '邮件', value: 'email' },
                { key: 'test', text: '微信测试号', value: 'test' },
                { key: 'corp_app', text: '企业微信应用号', value: 'corp_app' },
                { key: 'corp', text: '企业微信群机器人', value: 'corp' },
                { key: 'lark', text: '飞书群机器人', value: 'lark' },
                { key: 'ding', text: '钉钉群机器人', value: 'ding' },
                { key: 'bark', text: 'Bark App', value: 'bark' },
                { key: 'client', text: 'WebSocket 客户端', value: 'client' },
                { key: 'telegram', text: 'Telegram 机器人', value: 'telegram' },
                { key: 'discord', text: 'Discord 群机器人', value: 'discord' },
              ]}
              value={inputs.channel}
              onChange={handleInputChange}
            />
            <Form.Input
              label='推送 token'
              placeholder='未设置则不检查 token'
              value={inputs.token}
              name='token'
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button onClick={() => submit('general')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('')}>测试</Button>
          <Divider />
          <Header as='h3'>
            邮箱设置（email）
            <Header.Subheader>通过邮件进行推送</Header.Subheader>
          </Header>
          <Message>
            邮件推送方式（email）需要设置邮箱，请前往个人设置页面绑定邮箱地址。
          </Message>
          <Button onClick={() => test('email')}>测试</Button>
          <Divider />
          <Header as='h3'>
            微信测试号设置（test）
            <Header.Subheader>
              通过微信测试号进行推送，点击前往配置：
              <a
                target='_blank'
                href='https://mp.weixin.qq.com/debug/cgi-bin/sandboxinfo?action=showinfo&t=sandbox/index'
              >
                微信公众平台接口测试帐号
              </a>
            </Header.Subheader>
          </Header>
          <Message>
            需要新增测试模板，模板标题推荐填写为「消息推送」，模板内容必须填写为
            {' {{'}text.DATA{'}}'}。
          </Message>
          <Form.Group widths={3}>
            <Form.Input
              label='测试号 ID'
              name='wechat_test_account_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_test_account_id}
              placeholder='测试号信息 -> appID'
            />
            <Form.Input
              label='测试号密钥'
              name='wechat_test_account_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_test_account_secret}
              placeholder='测试号信息 -> appsecret'
            />
            <Form.Input
              label='测试模板 ID'
              name='wechat_test_account_template_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_test_account_template_id}
              placeholder='模板消息接口 -> 模板 ID'
            />
          </Form.Group>
          <Form.Group widths={3}>
            <Form.Input
              label='用户 Open ID'
              name='wechat_test_account_open_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_test_account_open_id}
              placeholder='扫描测试号二维码 -> 用户列表 -> 微信号'
            />
          </Form.Group>
          <Button onClick={() => submit('test')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('test')}>测试</Button>
          <Divider />
          <Header as='h3'>
            企业微信应用号设置（corp_app）
            <Header.Subheader>
              通过企业微信应用号进行推送，点击前往配置：
              <a
                target='_blank'
                href='https://work.weixin.qq.com/wework_admin/frame#apps'
              >
                企业微信应用管理
              </a>
            </Header.Subheader>
          </Header>
          <Message>
            注意，企业微信要求配置可信 IP，步骤：应用管理 -> 自建 -> 创建应用 ->
            应用设置页面下拉中找到「企业可信 IP」，点击配置 -> 设置可信域名 ->
            在「可调用
            JS-SDK、跳转小程序的可信域名」下面填写一个域名，然后点击「申请校验域名」，根据提示完成校验
            -> 之后填写服务器 IP 地址（此 IP
            地址是消息推送服务所部署在的服务器的 IP
            地址，未必是上面校验域名中记录的 IP 地址）。
          </Message>
          <Form.Group widths={3}>
            <Form.Input
              label='企业 ID'
              name='wechat_corp_account_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_corp_account_id}
              placeholder='我的企业 -> 企业信息 -> 企业 ID'
            />
            <Form.Input
              label='应用 AgentId'
              name='wechat_corp_account_agent_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_corp_account_agent_id}
              placeholder='应用管理 -> 自建 -> 创建应用 -> AgentId'
            />
            <Form.Input
              label='应用 Secret'
              name='wechat_corp_account_agent_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_corp_account_agent_secret}
              placeholder='应用管理 -> 自建 -> 创建应用 -> Secret'
            />
          </Form.Group>
          <Form.Group widths={3}>
            <Form.Input
              label='用户账号'
              name='wechat_corp_account_user_id'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.wechat_corp_account_user_id}
              placeholder='通讯录 -> 点击姓名 -> 账号'
            />
            <Form.Select
              label='微信企业号客户端类型'
              name='wechat_corp_account_client_type'
              options={[
                {
                  key: 'plugin',
                  text: '微信中的企业微信插件',
                  value: 'plugin',
                },
                { key: 'app', text: '企业微信 APP', value: 'app' },
              ]}
              value={inputs.wechat_corp_account_client_type}
              onChange={handleInputChange}
            />
          </Form.Group>
          <Button onClick={() => submit('corp_app')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('corp_app')}>测试</Button>
          <Divider />
          <Header as='h3'>
            企业微信群机器人设置（corp）
            <Header.Subheader>
              通过企业微信群机器人进行推送，配置流程：选择一个群聊 -> 设置 ->
              群机器人 -> 添加 -> 新建 -> 输入名字，点击添加 -> 点击复制 Webhook
              地址
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='Webhook 地址'
              name='corp_webhook_url'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.corp_webhook_url}
              placeholder='在此填写企业微信提供的 Webhook 地址'
            />
          </Form.Group>
          <Button onClick={() => submit('corp')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('corp')}>测试</Button>
          <Divider />
          <Header as='h3'>
            飞书群机器人设置（lark）
            <Header.Subheader>
              通过飞书群机器人进行推送，飞书桌面客户端的配置流程：选择一个群聊
              -> 设置 -> 群机器人 -> 添加机器人 -> 自定义机器人 -> 添加（
              <strong>注意选中「签名校验」</strong>）。具体参见：
              <a
                target='_blank'
                href='https://open.feishu.cn/document/ukTMukTMukTM/ucTM5YjL3ETO24yNxkjN'
              >
                飞书开放文档
              </a>
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='Webhook 地址'
              name='lark_webhook_url'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.lark_webhook_url}
              placeholder='在此填写飞书提供的 Webhook 地址'
            />
            <Form.Input
              label='签名校验密钥'
              name='lark_webhook_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.lark_webhook_secret}
              placeholder='在此填写飞书提供的签名校验密钥'
            />
          </Form.Group>
          <Button onClick={() => submit('lark')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('lark')}>测试</Button>
          <Divider />
          <Header as='h3'>
            钉钉群机器人设置（ding）
            <Header.Subheader>
              通过钉钉群机器人进行推送，钉钉桌面客户端的配置流程：选择一个群聊
              -> 群设置 -> 智能群助手 -> 添加机器人（点击右侧齿轮图标） ->
              自定义 -> 添加（
              <strong>注意选中「加密」</strong>）。具体参见：
              <a
                target='_blank'
                href='https://open.dingtalk.com/document/robots/custom-robot-access'
              >
                钉钉开放文档
              </a>
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='Webhook 地址'
              name='ding_webhook_url'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.ding_webhook_url}
              placeholder='在此填写钉钉提供的 Webhook 地址'
            />
            <Form.Input
              label='签名校验密钥'
              name='ding_webhook_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.ding_webhook_secret}
              placeholder='在此填写钉钉提供的签名校验密钥'
            />
          </Form.Group>
          <Button onClick={() => submit('ding')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('ding')}>测试</Button>
          <Divider />
          <Header as='h3'>
            Bark 设置（bark）
            <Header.Subheader>
              通过 Bark 进行推送，下载 Bark 后按提示注册设备，之后会看到一个
              URL，例如 <code>https://api.day.app/wrsVSDRANDOM/Body Text</code>
              ，其中 <code>wrsVSDRANDOM</code> 就是你的推送 key。
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='服务器地址'
              name='bark_server'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.bark_server}
              placeholder='在此填写 Bark 服务器地址'
            />
            <Form.Input
              label='推送 key'
              name='bark_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.bark_secret}
              placeholder='在此填写 Bark 推送 key'
            />
          </Form.Group>
          <Button onClick={() => submit('bark')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('bark')}>测试</Button>
          <Divider />
          <Header as='h3'>
            WebSocket 客户端设置（client）
            <Header.Subheader>
              通过 WebSocket
              客户端进行推送，可以使用官方客户端实现，或者根据协议自行实现。官方客户端
              <a
                target='_blank'
                href='https://github.com/songquanpeng/personal-assistant'
              >
                详见此处
              </a>
              。
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='客户端连接密钥'
              name='client_secret'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.client_secret}
              placeholder='在此设置客户端连接密钥'
            />
          </Form.Group>
          <Button onClick={() => submit('client')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('client')}>测试</Button>
          <Divider />
          <Header as='h3'>
            Telegram 机器人设置（telegram）
            <Header.Subheader>
              通过 Telegram 机器人进行消息推送。首先向
              <a href='https://t.me/botfather' target='_blank'>
                {' '}
                Bot Father{' '}
              </a>
              申请创建一个新的机器人，之后在下方输入获取到的令牌，然后点击你的机器人，随便发送一条消息，之后点击下方的「获取会话
              ID」按钮，系统将自动为你填写会话
              ID，最后点击保存按钮保存设置即可。
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='Telegram 机器人令牌'
              name='telegram_bot_token'
              type='password'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.telegram_bot_token}
              placeholder='在此设置 Telegram 机器人令牌'
            />
            <Form.Input
              label='Telegram 会话 ID'
              name='telegram_chat_id'
              type='text'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.telegram_chat_id}
              placeholder='在此设置 Telegram 会话 ID'
            />
          </Form.Group>
          <Button onClick={getTelegramChatId} loading={loading}>
            获取会话 ID
          </Button>
          <Button onClick={() => submit('telegram')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('telegram')}>测试</Button>
          <Divider />
          <Header as='h3'>
            Discord 群机器人设置（discord）
            <Header.Subheader>
              通过 Discord 群机器人进行推送，配置流程：选择一个 channel -> 设置
              -> 整合 -> 创建 Webhook -> 点击复制 Webhook URL
            </Header.Subheader>
          </Header>
          <Form.Group widths={2}>
            <Form.Input
              label='Webhook 地址'
              name='discord_webhook_url'
              onChange={handleInputChange}
              autoComplete='off'
              value={inputs.discord_webhook_url}
              placeholder='在此填写 Discord 提供的 Webhook 地址'
            />
          </Form.Group>
          <Button onClick={() => submit('discord')} loading={loading}>
            保存
          </Button>
          <Button onClick={() => test('discord')}>测试</Button>
        </Form>
      </Grid.Column>
    </Grid>
  );
};

export default PushSetting;
