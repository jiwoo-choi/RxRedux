
# RxRedux

Inspired by [ReactorKit](https://github.com/ReactorKit/ReactorKit)

RxRedux is a framework for React Web Application to seperate view model from view to make entire codes more testable using Rxjs.

Most of concepts of this project are identical to [ReactorKit](https://github.com/ReactorKit/ReactorKit), You can check the detailed explanation of specific concepts of this framework in its [repository](https://github.com/ReactorKit/ReactorKit). 

## Installation
```
npm i reactivex-redux
```

## Reactor (a.k.a. Store)
Reactor is "UI-independent" View-Model layer which manages the state of a view.

### Main Concepts

- Action : Abstraction of the user interaction.
- Mutation : The stage which can mutate the app's state.
- State : Abstraction of view's state.

View -> Dispatching Action -> **[Action -> Mutation -> State]** -> new state -> View Update.

### How Reactor works with React-Components.

1. An element in the component (like a button) dispatches the action.
2. Reactor's `Action` receives the action.
3. Reactor convert this stream to `Mutation` stream through `mutate()` method.
4. Reactor's `Mutation` stage mutates the states (side effecct happens in this step).
5. This will call `reduce()` methods to reduce old state to new state.
6. new states will be updated in the view component whcih subscribes the Reactor.

## Example: Reactor
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
**State & InitialState**
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

If you know a better way to create types, go for it.

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

## Methods

### Constructor

| parameter     | required | default |
|---------------|----------|---------|
| initialState  | true     | none    |
| isStubEnabled | false    | false   |

### mutate() and reduce()

`mutate()` receives dispatched action, and generates an `Observable<Mutation>`

`reduce()` reduces old states with `Mutation` to new states.

See above for detailed examples. 


### transform()
Before your stream is delivered to one of the stage, you can transform your observable stream.

In this example, messages are logged before your states updated. (i.e. before your stream get to the `State` stage)
```
transformState(state: Observable<State>): Observable<State> {
	return state.pipe( tap( _ => console.log("state update!"))
}
```

## View-Binding

RxRedux provides a way to bind your Reactor with React-Component.

### withReactor(component)

As of 1.0.4, RxRedux provides higher order component called `withReactor()`

| parameter     | required | default |
|---------------|----------|---------|
| Component  | true     | none    |
| parentFilterMapper | false    | false   |
| transfromStateStreamFromThisComponent | false    | true   |
| skipSync | false    | true   |

This HOC automatically subscribes reactor's from parents component.

- parentFilterMapper : You don't have to subscribe all of the property in state objects. you can specify keys you want to subscribe as mapper function.
- transfromStateStreamFromThisComponent : If this is true, the mapper function will automatically apply to child component.
- skipSync : reactor emits current states when you start subscribing using `shareReplay()` operator in `rxjs`. You can ignore this call avoid redundant re-rendering. 


## (Auomatic) Testing

### Testing for Reactor.

You can easily testing `Reactor` since it is UI-Independent.

for example,

**1. Action testing**
```
it('click write -> mode change test ', done  => {
	
	// create reactor
	reactor = new  ForumReactor(initialState);
	
	// dispatch action.
	reactor.dispatch({type:"CLICKWRITE"})
	
	// check its state.
	expect(reactor.currentState.mode).toBe("edit")
	done();
})
```

**2. Testing containing side effect (API Call)**
```
it('5. side effect : click topic -> topic change -> loading -> (success) -> loading -> isError false test', done  => {

	// API Request Mock-up.
	moxios.wait(() => {
		const  request = moxios.requests.mostRecent()
		request.respondWith({ status:  200, response:  listResultMockup }) 
	})

	// create reactor
	reactor = new  ForumReactor(initialState);


	let  state_change = 0;

	//subscribe reactor to check we received expected value.
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


### Testing for Component<->Reactor.

Component<->Reactor testing can be tested with `Stub`

### What is Stub?

Stub is a testing utilities implemented in Reactor.
Stub can log every actions you've dispatched from Component and force state change.

To enable Stub, you need to set `isStubEnbabled` as `true` in constuctor arguments.
```
const reactor = new ForumReactor(initialState, true)
```

**Example**
```
it('9. View Binding Check', done  => {
	
	// create Reactor with StubEnableMode on.
	reactor = new  ForumReactor(initialState, true);

	// mount by `Enzyme`
	const  wrapper = shallow(<R6Table></R6Table>);

	// check reactor exist to bind with in original code.
	expect((wrapper.instance() as  any).reactor).not.toBe(undefined);

	// inject new reactor in the code.
	(wrapper.instance() as  any).reactor = reactor;

	// you can remount your component or call custom bind() function in your component.
	(wrapper.instance() as  any).bind(reactor);

	// simulate button action using `enzyme` testing.
	wrapper.find('button').at(0).simulate('click')

	// stub can log every actions from view components.
	expect(reactor.stub.lastAction.type).toBe("CLICKBACK");

	// stub also can force new state.
	reactor.stub.state.next({...initialState, mode :  "edit"});

	// you can check new state in Component.
	expect((wrapper.state() as  ForumState).mode).toBe("edit");
	
	done();
})

```

## Additional Tips.

### Scheuder

You can specify RxJs's scheduler when you defining Reactor class, but it must be a **serial queue.**

### ReactorHook (experimental)

RxRedux supports functional components using custom hooks, but you need to define new class which extends `ReactorHook<Action,State,Mutation>`

`ReactorHook` is same as `Reactor` class, but it has depedency on `react` library's native hook methods.

```
const [reactor, currentState] = SomeHookReactor.use(initialState)
```
This will also update your functional view component every time current state changes.


### RxjsExtension

This provides some Rxjs operator extension. 
`catchErrorJustReturn()` & `catchErrorReturnEmpty`& `deepDistinctUntilChanged()`

### ReactorGroup

This injects Reactor its child.
```
<ReactorGroup reactor={this.reactor}>
	<R6CommunityNavigation></R6CommunityNavigation>
	<R6List></R6List>
	<R6ListFooter></R6ListFooter>
	<R6PostWrite></R6PostWrite>
	<R6Post></R6Post>
</ReactorGroup>
```


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
- 1.0.4 : withReactor update.
- 1.0.4 : bug-fix : state is undeliberately mutated.
- Readme update.
- 글로벌 스토어 삭제, HOC 바인딩 방식, ReactorGroup & Rxjsextension추가.
