<template>
  <div class="navbar">
    <hamburger id="hamburger-container" :is-active="sidebar.opened" class="hamburger-container" @toggleClick="toggleSideBar" />

    <breadcrumb id="breadcrumb-container" class="breadcrumb-container" />

    <div class="right-menu">
      <template v-if="device!=='mobile'">

        <el-tooltip :content="familyModeName" effect="dark" placement="bottom">
          <span v-if="familyMode=='P'" class="right-menu-item hover-effect">
            <svg-icon icon-class="user"  @click="dispatchProfile"/>
          </span>
          <span v-else class="right-menu-item hover-effect">
            <svg-icon icon-class="peoples"  @click="dispatchProfile"/>
          </span>
        </el-tooltip>

        <el-tooltip content="概要统计" effect="dark" placement="bottom">
          <span class="right-menu-item hover-effect">
            <svg-icon icon-class="analyse" @click="handleGeneralStat"/>
          </span>
        </el-tooltip>

        <el-tooltip content="计划统计" effect="dark" placement="bottom">
          <span class="right-menu-item hover-effect">
            <svg-icon icon-class="plan" @click="handleDispatch('UserPlan/commonStat')"/>
          </span>
        </el-tooltip>

        <el-tooltip content="提醒统计" effect="dark" placement="bottom">
          <span class="right-menu-item hover-effect">
            <svg-icon icon-class="notify" @click="handleDispatch('NotifyStatList')"/>
          </span>
        </el-tooltip>
        
        <search id="header-search" class="right-menu-item" />

        <el-tooltip content="我的日历" effect="dark" placement="bottom">
          <span class="right-menu-item hover-effect">
            <svg-icon icon-class="calendar" @click="handleDispatch('UserCalendar/myCalendar')"/>
          </span>
        </el-tooltip>

        <el-tooltip content="智能客服" effect="dark" placement="bottom">
          <span class="right-menu-item hover-effect">
            <svg-icon icon-class="cs" @click="handleCustomService"/>
          </span>
        </el-tooltip>

        <el-tooltip content="我的消息" effect="dark" placement="bottom">
          <span class="right-menu-item hover-effect">
            <el-badge :value="newMsgCount" :hidden="msgHidden" class="item">
              <svg-icon icon-class="message" @click="handleDispatch('UserMessage')"/>
            </el-badge>
          </span>
        </el-tooltip>

        <screenfull id="screenfull" class="right-menu-item hover-effect" />

        <el-tooltip content="布局大小" effect="dark" placement="bottom">
          <size-select id="size-select" class="right-menu-item hover-effect" />
        </el-tooltip>

      </template>
      <el-dropdown class="right-menu-item">
        <span class="el-dropdown-link">
          快速导航
          <i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <template v-for="item in fastMenus">
            <el-dropdown-item icon="el-icon-link" @click.native="handleDispatch(item.pathName)">{{ item.menuName }}</el-dropdown-item>
          </template>
        </el-dropdown-menu>
      </el-dropdown>
      <el-dropdown class="avatar-container right-menu-item hover-effect" trigger="click">
        <div class="avatar-wrapper">
          <img :src="avatar" class="user-avatar">
          <i class="el-icon-caret-bottom" />
        </div>
        <el-dropdown-menu slot="dropdown">
          <router-link to="/user/profile">
            <el-dropdown-item>个人中心</el-dropdown-item>
          </router-link>
          <el-dropdown-item @click.native="setting = true">
            <span>布局设置</span>
          </el-dropdown-item>
          <el-dropdown-item divided @click.native="logout">
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>

    <!-- 智能客服 -->
    <el-dialog :title="csTitle" width="700px" :visible.sync="csOpen"  append-to-body>
      <custom-service />
    </el-dialog>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Breadcrumb from '@/components/Breadcrumb'
import Hamburger from '@/components/Hamburger'
import Screenfull from '@/components/Screenfull'
import SizeSelect from '@/components/SizeSelect'
import Search from '@/components/HeaderSearch'
import CustomService from '@/views/system/cs/customService'
import {getIndexFastMenu} from "@/api/auth/fastMenu";
import {getLatestMessage}  from "@/api/log/userMessage";

export default {
  components: {
    Breadcrumb,
    Hamburger,
    Screenfull,
    SizeSelect,
    Search,
    'custom-service':CustomService
  },
  data() {
    return {
      //智能客服
      csTitle:'',
      csOpen:false,
      //快捷菜单
      fastMenus:[],
      newMsgCount:0,
      msgHidden:true,
      familyModeName:'当前登陆模式:个人'
    };
  },
  computed: {
    ...mapGetters([
      'sidebar',
      'avatar',
      'device',
      'familyMode',
      'name'
    ]),
    setting: {
      get() {
        return this.$store.state.settings.showSettings
      },
      set(val) {
        this.$store.dispatch('settings/changeSetting', {
          key: 'showSettings',
          value: val
        })
      }
    }
  },
  created() {
    this.handleFastMenus();
    if(this.familyMode=='F'){
      this.familyModeName='当前登陆模式:家庭';
    }
    //查收最新的消息
    // this.$nextTick(() => {
    //   setInterval(this.handleLatestMessage, 5000);
    // })
  },
  methods: {
    //路由跳转
    handleDispatch(name) {
      //路由定向
      this.$router.push({name:name,query: {}})
    },
    /** 跳转到个人中心 */
    dispatchProfile(){
      this.$router.push({path:'/user/profile'});
    },
    /** 概要统计 */
    handleGeneralStat(){
      this.$router.push({path:'/main/generalStat'});
    },
    /** 智能客服 */
    handleCustomService(){
      this.csTitle='智能客服';
      this.csOpen=true;
    },
    /** 快捷菜单 */
    handleFastMenus(){
      getIndexFastMenu().then(
        response => {
          let list = new Array();
          const n = response.length;
          for(let i=0;i<n;i++){
            let s = response[i];
            //pathName首字母大写
            let menu={
              menuName:s.functionName,
              pathName:s.path.substring(0, 1).toUpperCase() + s.path.substring(1)
            };
            list.push(menu);
          }
          this.fastMenus = list;
        }
      );
    },
    //获取最新的消息
    handleLatestMessage(){
      getLatestMessage().then(
        response => {
          if(response!=null){
            this.newMsgCount=1;
            this.msgHidden=false;
            this.msgSuccess('有新的一条消息:'+response.title);
          }else{
            this.newMsgCount=0;
            this.msgHidden=true;
          }
        }
      );
    },
    toggleSideBar() {
      this.$store.dispatch('app/toggleSideBar')
    },
    async logout() {
      this.$confirm('确定注销并退出系统吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.$store.dispatch('LogOut').then(() => {
          location.href = '/index';
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.navbar {
  height: 50px;
  overflow: hidden;
  position: relative;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);

  .hamburger-container {
    line-height: 46px;
    height: 100%;
    float: left;
    cursor: pointer;
    transition: background .3s;
    -webkit-tap-highlight-color:transparent;

    &:hover {
      background: rgba(0, 0, 0, .025)
    }
  }

  .breadcrumb-container {
    float: left;
  }

  .errLog-container {
    display: inline-block;
    vertical-align: top;
  }

  .right-menu {
    float: right;
    height: 100%;
    line-height: 50px;

    &:focus {
      outline: none;
    }

    .right-menu-item {
      display: inline-block;
      padding: 0 8px;
      height: 100%;
      font-size: 18px;
      color: #5a5e66;
      vertical-align: text-bottom;

      &.hover-effect {
        cursor: pointer;
        transition: background .3s;

        &:hover {
          background: rgba(0, 0, 0, .025)
        }
      }
    }

    .avatar-container {
      margin-right: 30px;

      .avatar-wrapper {
        margin-top: 5px;
        position: relative;

        .user-avatar {
          cursor: pointer;
          width: 40px;
          height: 40px;
          border-radius: 10px;
        }

        .el-icon-caret-bottom {
          cursor: pointer;
          position: absolute;
          right: -20px;
          top: 25px;
          font-size: 12px;
        }
      }
    }
  }
}
</style>
