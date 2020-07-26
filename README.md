
# RxRedux

Inspired by [ReactorKit](https://github.com/ReactorKit/ReactorKit)

RxRedux is a framework for React Web Application to seperate view model from view logic to make entire codes more testable.

Most of concepts of this project are identical to [ReactorKit](https://github.com/ReactorKit/ReactorKit), You can check the detailed explanation of specific concepts of this framework in its [repository](https://github.com/ReactorKit/ReactorKit). 

## Installation
```
npm i reactivex-redux
```

## Reactor
Reactor is "UI-independent" View-Model layer which manages the state of a view.

### Main Concepts

- Action : Abstraction of the user interaction.
- Mutation : The stage or process which can mutate the app's state.
- State : Abstraction of view's state.

View -> Dispatching Action -> [Action -> Mutation -> State] -> new state -> View Update.

### How Reactor works with React-Components.

1. An Element in the component (like a button) dispatches the action.
2. Reactor's `Action` receives the action.
3. Reactor convert this stream to `Mutation` stream through `mutate()` method.
4. Reactor's `Mutation` stage mutates the states (side effecct happens in this stage).
5. This will call `reduce()` methods to reduce old state to new state.
6. new states will be updated in the view component whcih subscribes the Reactor.


### Example: Reactor
Reactor is an abstract class, which requires you to implement `mutate()` and `reduce()` with `Action`, `Mutation`, `State` types.

### Example 1: Creating Type for `Action`, `Mutation`, `State`

**Action**
```
export const CLICKTOPIC = "CLICKTOPIC"

export interface CLICKTOPIC {
    type: typeof CLICKTOPIC;
    newTopic: Topic,
}

export type ForumAction = CLICKTOPIC
```
**Mutation**
```
export const SETLOADING = "SETLOADING"
export const FETCHLIST = "FETCHLIST"

export interface SETLOADING {
    type: typeof SETLOADING,
    isLoading: boolean,
}

export interface FETCHLIST {
    type: typeof FETCHLIST,
    list: ListType[],
    page: number
}

type ForumMutation = SETLOADING | FETCHLIST 
```
**State & InitialState **
```
export interface ForumState {
    topic : Topic,
    mode: Mode,
    page: number,
    list: ListType[],
    isLoading:boolean,
    isError:boolean,
    post?: ContentType,
    isLogined: boolean,
}
export const ForumStateInitialState : ForumState = {
    isError: false,
    isLoading: true,
    page: 1,
    mode:"list",
    topic:"tips",
    post: undefined,
    list:[],
    isLogined: false,
}
```

If you know the better way to create type, go for it.

you could check out Redux's action generator library. [typesface-actions](https://github.com/piotrwitek/typesafe-actions)


**Construct Class**

You need to implement two method `mutate()` and `reduce()`.

```
class ForumReactor extends Reactor<ForumAction, ForumState, ForumMutation> {

   mutate(action: ForumAction): Observable<ForumMutation> {
	... // convert action stream to mutation stream. 
   }
   reduce(state: ForumState, mutation: ForumMutation) {
        ... // reduce old state to new state.
   }
} 
```

**example of `mutate()` and `reduce()`**

Using `Rxjs`'s `concat()` methods, you can serialize your stream. 
```
mutate(...){
....
case "CLICKPAGE":
    return concat(
	// 1. loading on
	of<ForumMutation>({type:"SETLOADING", isLoading: true}),
	// 2. fetching List
	this.fetchList(this.currentState.topic, action.newPage).pipe(
	    takeUntil(this.action.pipe(filter(value => value === action))),
	    map<ListType[], ForumMutation>( res => {
		return {type:"FETCHLIST", list: res, page: 1 } 
	    })
	),
	// 3. Loading off
	of<ForumMutation>({type:"SETLOADING", isLoading: false}),
    }
   ...
```

```
reduce(...) {
...
    case "FETCHLIST":
	newState.isLoading = false;
	if (mutation.list.length === 0){
	    newState.isError = true;
	    return newState
	} else {
	    newState.list = mutation.list;
	    newState.page = mutation.page;
	    return newState
	}
 ....
}
```

**Usage**
```
const reactor = new ForumReactor(initialState)
...
//dispatching action.
reactor.dispatch({type:"CLICKPAGE"})

//subscribe reaction from Reactor
reactor.state.subscribe( res => console.log(res) )
```



## 메소드

### 생성자

| parameter     | required | default |
|---------------|----------|---------|
| initialState  | true     | none    |
| isStubEnabled | false    | false   |

- initialState : state의 처음 상태입니다.
- isStubEnabled : 테스팅용 Stub입니다. View와의 바인딩을 체크하기 위한 용도입니다.

### Mutate & Reduce
- mutate()는 action으로부터 state를 변경시킬 수 있는 로직을 작성하는 부분입니다.
```
mutate(action: ForumAction): Observable<ForumMutation> {
	switch(action.type) {
		case "CLICKTOPIC":
			return concat(
				//topic change
				of({type:"TOPICCHANGE", topic:  action.newTopic}),
				//is Loading
				of({type:"SETLOADING", isLoading:  true}),
				//WebRequest
				this.fetchList(action.newTopic).pipe(
				takeUntil(this.action.pipe(filter(value  =>  value === action))),
				map( res  => {
				return {type:"FETCHLIST", list:  res, page:  1 }
			})
		...
		...
}
```
- reduce()는 mutation의 결과로부터 state를 업데이트 하는 부분입니다.
```
reduce(state: ForumState, mutation: ForumMutation): ForumState {
	let  newState = state;
	switch(mutation.type) {
		case  "TOPICCHANGE":
		newState.topic = mutation.topic
		return  newState;
	}
	...
}
```

### Transform
transform 메소드는 각 스테이지의 `Observable`을 변경할 수 있습니다. Observable을 확장하거나, 특정 operator를 일괄적으로 적용하고 싶을때 사용할 수 있습니다.
```
transformState(state: Observable<State>): Observable<State> {
	return merge(state, otherReactor.state)
}
// 이제 이 reactor는 state는 otherReactor의 state또한 구독합니다.
```

```
transformState(state: Observable<State>): Observable<State> {
	return state.pipe( tap( _ => console.log("state update!"))
}
// 이제 이 reactor는 state는 업데이트 될때마다 console에 로그를 찍습니다.
```

### Scheduler
async 스케줄러를 사용하면, 원하는 결과값을 도출 할 수 없습니다.
기본 스케줄러는 queueScheduler 입니다.
자세한 내용은 rxjs scheulder를 참조하세요.

### disposeAll
```
reactor.disposeAll();
```
리액터 안에 사용되는 Observable들의 Subscription 해지합니다.

# React-바인딩
리액트의 컴포넌트와 바인딩 할 수 있는 HOC와 메소드도 지원합니다.

## useReactor
```
export default useReactor(Component);
```

# ReactorHook (Experimental)
Functional Component 에서 리액터를 사용할 수 있도록 나온 FC전용 리액터 입니다. Reactor와 기본방식은 같으나 상태관리에 사용할 수 있는 custom hook을 추가하였습니다.

* 뷰와 별도의 바인딩 과정 없이, state의 변화가 감지되면 뷰가 업데이트됩니다.
```
const initalState = {a:123}

function  MyView(){
	const [reactor, currentState] = MyReactor.use(initalState);
	return (
	<>
		<button  onClick={()=>{reactor.action.next({})}}>button</button>
		<div>  {currentState.a}</div>
	</>
	)
}
```

```
class MyReactor extends ReactorHook<Action,State..> {
	mutate(){
		.....
	}
	reduce() {
		....
	}
}
```

# 테스팅

## (자동) 테스팅 대상.
1. 리액터의 검증.
	- 리액터가 원하는 방식대로 Action->Mutate->State 를 따르는지 체크합니다.
	- 로직 테스트이기 때문에 간단히 테스트할 수 있습니다.

2. 뷰와 리액터의 bind() 검증.
	- 뷰와 리액터가 연결되어 있는지 체크합니다.
	- 테스트가 까다롭지만, 컴포넌트와 리액터가 서로 바인딩만 되어있는지 검증합니다.
	

### 1. 리액터 검증

예제 1) action -> state 변경 테스트.
```
it('click write -> mode change test ', done  => {
	reactor = new  ForumReactor(initialState);
	// 액션을 보냅니다.
	reactor.action.next({type:"CLICKWRITE"})
	// 액션에 따라 state가 변하는지 체크합니다.
	expect(reactor.currentState.mode).toBe("edit")
	done();
})
```

예제 2) 다양한 액션이 일어나는 경우에 대한 테스트.
```
it('5. side effect : click topic -> topic change -> loading -> (success) -> loading -> isError false test', done  => {

//moxios 목업 구성.
moxios.wait(() => {
	const  request = moxios.requests.mostRecent()
	request.respondWith({ status:  200, response:  listResultMockup }) 
})

reactor = new  ForumReactor(initialState);

let  state_change = 0;
//리액터의 변경을 여기서 구독합니다.
//concat을 통해 여기서 전달받습니다.
from(reactor.state).subscribe(
	state  => {
        if(state_change === 1) {
            expect(state.topic).toBe("tips");
        } else  if (state_change === 2) {
            expect(state.isLoading).toBeTruthy();
        } else  if (state_change === 3) {
            expect(state.list.length).toBe(2);
        } else  if (state_change === 4) {
            expect(state.isLoading).toBeFalsy();
            expect(state.isError).toBeFalsy();
            done();
        } else {
            done.fail();
        }
            state_change++;
        }
    )
    reactor.action.next({type:"CLICKTOPIC", newTopic:  "tips"})
})
```

## View - Reactor 바인딩 검증.
### 1. 뷰코드 예시.
```

class  SomeView  extends  React.Component<{}, ForumState> implements  ReactorView<ForumReactor> {

button?: HTMLElementSubject;
reactor?: ForumReactor | undefined

constructor(props:{}){
super(props);
	this.state = {
		isError:  false,
		isLoading:  false,
		page:  1,
		mode:"list",
		topic:"clan",
		post:  undefined,
		list:[],
	}
}

componentDidMount(){
	this.reactor = new  ForumReactor(this.state);
}

bind(reactor: ForumReactor): DisposeBag {
	let  disposeBag = new  DisposeBag();
	
	reactor?.state.pipe(
	map(res  =>  res.mode),
	deepDistinctUntilChanged()
	).subscribe( mode  =>  this.setState({mode}))
	return  disposeBag;
}

render(){
	return (
		<button onClick={()=>{this.reactor.next({type:"CLICKBACK"}}></button>
	)
}
}
```
### 2. 테스트 코드
```
it('9. View Binding Check', done  => {
	
	reactor = new  ForumReactor(initialState, true);

	// enzyme을 통해 마운트시키기
	const  wrapper = shallow(<R6Table></R6Table>);

	// 1. 리액터가 이미 존재하는지 체크.
	expect((wrapper.instance() as  any).reactor).not.toBe(undefined);

	// 2. 테스트에서 사용할 리액터를 주입.
	(wrapper.instance() as  any).reactor = reactor;

	// 3. bind()를 수동으로 다시 불러 리액터 업데이트 시키기.
	(wrapper.instance() as  any).bind(reactor);

	// 4. enzyme을 통해 button을 시뮬레이트한다.
	wrapper.find('button').at(0).simulate('click')

	// 5. stub은 모든 액션 기록을 저장한다. 액션을 비교한다.
	expect(reactor.stub.lastAction.type).toBe("CLICKBACK");

	// 6. stub은 또한 state에서 액션을 내보낼 수 있다.
	reactor.stub.state.next({...initialState, mode :  "edit"});

	// 7. 액션을 내보낸 뒤, state가 제대로 변경되었는지 체크한다.
	expect((wrapper.state() as  ForumState).mode).toBe("edit");
	done();
})
```

## 그 외 예제.

### Action & Mutation & State정의
```
interface State {
    value: number
}

export const INCREASE = 'INCREASE'
export const DECREASE = 'DECREASE'

interface INCREASEACTION { 
    type: typeof INCREASE
}
interface DECREASEACTION { 
    type: typeof DECREASE
}

export type ActionType = INCREASEACTION | DECREASEACTION
```
`Redux`의 유틸 라이브러리를 활용해 조금더 쉽게 타입을 생성할 수 있습니다.


### To-do list

- [x] initial Commit
- [X] 비동기 대응.
- [X] 비동기 처리 에러.
- [X] 프로젝트 테스트 코드 추가 및 테스트.
- [X] 테스트 기능.
- [X] 문서작성.
- [X] 뷰 .
- [X] 훅기능 추가 (beta)
- [ ] 코드 테스트.
- [ ] 디버깅 기능 추가.

### Dependency
- Rxjs 
- lodash
- react (binding)

### 업데이트 내역
- 글로벌 스토어 삭제, HOC 바인딩 방식, ReactorGroup & Rxjsextension추가.
