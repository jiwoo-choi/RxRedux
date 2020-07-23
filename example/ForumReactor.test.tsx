import ForumReactor, { ForumState } from "./ForumReactor";
import moxios from "moxios";
import { listResultMockup, postResultMockup } from "../../Data/mockup";
import { R6StatAPI } from "../../Library/R6StatAPI";
import { from } from "rxjs";
import { TestScheduler } from 'rxjs/testing';
import { delay } from "rxjs/operators";
import { mount, shallow } from "enzyme";
import R6Table1 from "./R6Table";
import {R6Table} from "./R6Table";

import React from 'react';
import { ReactorView } from "../../ReactorKit/ReactiveView";



describe( "Forum Reactor Test / Reactor Action -> Mutate -> State Test", () => {

    let reactor : ForumReactor;
    let initialState: ForumState = {
        isError: false,
        isLoading: false,
        page: 1,
        mode:"list",
        topic:"clan",
        post: undefined,
        list:[],
    }

    let api = R6StatAPI.shared.api;
    beforeEach(() => {
        moxios.install(api);
      })
      afterEach(() => {
        moxios.uninstall(api);
    })
    

    it('click write -> mode change test ', done => {
        reactor = new ForumReactor(initialState);
        reactor.action.next({type:"CLICKWRITE"})
        expect(reactor.currentState.mode).toBe("edit")
        done();
    })

    it('click back -> mode change test ', done => {
        reactor = new ForumReactor(initialState);
        reactor.action.next({type:"CLICKBACK"})
        expect(reactor.currentState.mode).toBe("list")
        done();
    })
    
    it('click wrtie -> click back -> mode change test ', done => {
        reactor = new ForumReactor(initialState);
        reactor.action.next({type:"CLICKWRITE"})
        reactor.action.next({type:"CLICKBACK"})
        expect(reactor.currentState.mode).toBe("list")
        done();
    })

    it( '1 .side effect : fetchList test (success)', (done) => {
        moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            request.respondWith({ status: 200, response: listResultMockup }) //mocked response
        })
        reactor = new ForumReactor(initialState);
        reactor.fetchList("free", 1).subscribe( res => {
            expect(res).toBe(listResultMockup);
            done();
        })
    })

    it( '2. side effect : fetchList test (failure)', (done) => {
        moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            request.respondWith({ status: 400, response: listResultMockup }) //mocked response
        })
        reactor = new ForumReactor(initialState);
        reactor.fetchList("free", 1).subscribe( res => {
            expect(res.length).toBe(0);
            done();
        })
    })

    it( '3. side effect : fetchPost test (success)', (done) => {
        moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            request.respondWith({ status: 200, response: postResultMockup }) //mocked response
        })
        reactor = new ForumReactor(initialState);
        reactor.fetchPost(1).subscribe( res => {
            expect(res).toBe(postResultMockup);
            done();
        })
    })


    it( '4. side effect : fetchPost test (failure)', (done) => {
        moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            request.respondWith({ status: 400, response: postResultMockup }) //mocked response
        })
        reactor = new ForumReactor(initialState);
        reactor.fetchPost(1).subscribe( res => {
            expect(res).toMatchObject({})
            done();
        })
    })


    it('5. side effect : click topic -> topic change -> loading -> (success) -> loading -> isError false test', done => {

        moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            request.respondWith({ status: 200, response: listResultMockup }) //mocked response
        })

        reactor = new ForumReactor(initialState);
        let state_change = 0;
        from(reactor.state).subscribe(
            state => {
                if(state_change === 1) {
                    expect(state.topic).toBe("tips");
                } else if (state_change === 2) {
                    expect(state.isLoading).toBeTruthy();
                } else if (state_change === 3) {
                    expect(state.list.length).toBe(2);
                } else if (state_change === 4) {
                    expect(state.isLoading).toBeFalsy();
                    expect(state.isError).toBeFalsy();
                    done();
                } else {
                    done();
                }
                state_change++;
            }
        )
        reactor.action.next({type:"CLICKTOPIC", newTopic: "tips"})        
    })


    it('6. side effect : click topic -> topic change -> loading -> (failure) -> loading -> isError false test', done => {

        moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            request.respondWith({ status: 400, response: listResultMockup }) //mocked response
        })

        reactor = new ForumReactor(initialState);
        let state_change = 0;
        from(reactor.state).subscribe(
            state => {
                if(state_change === 1) {
                    expect(state.topic).toBe("tips");
                } else if (state_change === 2) {
                    expect(state.isLoading).toBeTruthy();
                } else if (state_change === 3) {
                    expect(state.list.length).toBe(0);
                } else if (state_change === 4) {
                    expect(state.isLoading).toBeFalsy();
                    expect(state.isError).toBeTruthy();
                    done();
                } else {
                    done();
                }
                state_change++;
            }
        )
        reactor.action.next({type:"CLICKTOPIC", newTopic: "tips"})        
    })


    it('7. side effect : click post -> mode change -> loading -> (success) -> loading -> isError false test', done => {

        moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            request.respondWith({ status: 200, response: postResultMockup }) //mocked response
        })
        
        reactor = new ForumReactor(initialState);

        let state_change = 0;
        from(reactor.state).subscribe(
            state => {
                if(state_change === 1) {
                    expect(state.mode).toBe("view");
                } else if (state_change === 2) {
                    expect(state.isLoading).toBeTruthy();
                } else if (state_change === 3) {
                    expect(state.post).toMatchObject(postResultMockup);
                } else if (state_change === 4) {
                    expect(state.isLoading).toBeFalsy();
                    expect(state.isError).toBeFalsy();
                    done();
                } else {
                    done();
                }
                state_change++;
            }
        )
        reactor.action.next({type:"CLICKPOST", postId:1})  
    })


    it('8. side effect : click post -> mode change -> loading -> (failure) -> loading -> isError -> go back false test', done => {

        moxios.wait(() => {
            const request = moxios.requests.mostRecent()
            request.respondWith({ status: 400, response: postResultMockup }) //mocked response
        })

        reactor = new ForumReactor(initialState);
        let state_change = 0;
        from(reactor.state).subscribe(
            state => {
                console.log(state_change)

                if(state_change === 1) {
                    expect(state.mode).toBe("view");
                } else if (state_change === 2) {
                    expect(state.isLoading).toBeTruthy();
                } else if (state_change === 3) {
                    expect(state.post).toMatchObject({});
                } else if (state_change === 4) {
                    expect(state.isLoading).toBeFalsy();
                    expect(state.isError).toBeFalsy();
                    reactor.action.next({type:"CLICKBACK"})        
                } else if (state_change === 5) {
                    expect(state.mode).toBe("list")
                    done();
                } else if (state_change > 5) {
                    done.fail();
                }
                state_change++;
            }
        )
        reactor.action.next({type:"CLICKPOST", postId:1})  
    })


    it('9. View Check', done => {

        reactor = new ForumReactor(initialState, true);
        // enzyme을 통해 마운트시키기
        const wrapper = shallow(<R6Table></R6Table>); 

        // 1. 리액터가 이미 존재하는지 체크.
        expect((wrapper.instance() as any).reactor).not.toBe(undefined);

        // 2. 테스트에서 사용할 리액터를 주입.
        (wrapper.instance() as any).reactor = reactor;

        // 3. bind()를 수동으로 다시 불러 리액터 업데이트 시키기.
        (wrapper.instance() as any).bind(reactor);

        // 4. enzyme을 통해 button을 시뮬레이트한다.
        wrapper.find('button').at(0).simulate('click')

        // 5. stub은 모든 액션 기록을 저장한다. 액션을 비교한다.
        expect(reactor.stub.lastAction.type).toBe("CLICKBACK");

        // 6. stub은 또한 state에서 액션을 내보낼 수 있다.
        reactor.stub.state.next({...initialState, mode : "edit"});

        // 7. 액션을 내보낸 뒤, state가 제대로 변경되었는지 체크한다.
        expect((wrapper.state() as ForumState).mode).toBe("edit");

        done();

    })


})

